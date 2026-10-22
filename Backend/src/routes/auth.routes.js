import express from "express";
const router = express.Router();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import { signToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import asyncHandler from '../utils/asyncHandler.js';
import emailService from '../utils/email.js';
import { protect } from "../middleware/auth.middleware.js";
import validate from '../middleware/validate.js';
import LogService from '../services/log.service.js';
import { body } from 'express-validator';
import { permissions } from '../config/roles.js';
import expressRateLimit from 'express-rate-limit';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// Create stricter rate limiter for auth endpoints (login/register)
const authLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create moderate rate limiter for other auth operations
const authOperationsLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many requests, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

function checkRolesFor(action) {
    return (req, res, next) => {
        const userRole = req.user?.role ? String(req.user.role).toLowerCase() : null;
        if (!userRole || !permissions[action]?.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

function sanitizeUser(user) {
    if (!user) return null;
    const { password, resetPasswordToken, resetPasswordExpires, verificationToken, verificationExpires, ...safeUser } = user;
    return safeUser;
}

// Public Registration
router.post(
  "/register",
  authLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('username').notEmpty().withMessage('Username is required'),
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, username, fullName, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const computedFullName = fullName || [firstName, lastName].filter(Boolean).join(' ') || null;
    const verificationToken = emailService.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        username,
        fullName: computedFullName,
        verificationToken,
        verificationExpires,
      }
    });

    // Initialize user stats
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    }).catch(() => {});

    // Send verification & welcome emails (non-blocking)
    emailService.sendVerificationEmail(user.email, verificationToken, user.username).catch(() => {});
    emailService.sendWelcomeEmail(user.email, user.username).catch(() => {});

    const token = signToken({ id: user.id, role: user.role.toLowerCase() });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role.toLowerCase() });
    res.cookie("refreshToken", refreshToken, cookieOptions);

    await LogService.logAction('User registered', null, user.id);
    res.status(201).json({
      token,
      refreshToken,
      user: sanitizeUser(user)
    });
  })
);

// Public Login
router.post('/login',
  authLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        lastSeen: new Date(),
        isOnline: true
      }
    });

    const token = signToken({ id: updatedUser.id, role: updatedUser.role.toLowerCase() });
    const refreshToken = signRefreshToken({ id: updatedUser.id, role: updatedUser.role.toLowerCase() });
    res.cookie("refreshToken", refreshToken, cookieOptions);
    await LogService.logAction('User login', null, updatedUser.id);

    res.json({
      token,
      refreshToken,
      user: sanitizeUser(updatedUser)
    });
  })
);

// Refresh Token (supports both cookie and body refreshToken, mounted at /refresh-token and /refresh)
const handleRefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    const token = signToken({ id: user.id, role: user.role.toLowerCase() });
    const newRefreshToken = signRefreshToken({ id: user.id, role: user.role.toLowerCase() });
    res.cookie("refreshToken", newRefreshToken, cookieOptions);
    res.json({
      token,
      refreshToken: newRefreshToken,
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.post("/refresh-token", authOperationsLimiter, handleRefreshToken);
router.post("/refresh", authOperationsLimiter, handleRefreshToken);

router.post("/logout", asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { isOnline: false, lastSeen: new Date() }
    }).catch(() => {});
  }
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ message: "Logged out" });
}));

// Get current authenticated user
router.get('/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: sanitizeUser(user) });
  })
);

// View profile (alias for /api/users/profile)
router.get('/profile',
  protect,
  checkRolesFor('view'),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: sanitizeUser(user), ...sanitizeUser(user) });
  })
);

// Update profile (alias for /api/users/profile)
router.put('/profile',
  protect,
  checkRolesFor('updateProfile'),
  asyncHandler(async (req, res) => {
    const { fullName, firstName, lastName, bio, profilePicture } = req.body;
    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    else if (firstName !== undefined || lastName !== undefined) {
      updates.fullName = [firstName, lastName].filter(Boolean).join(' ');
    }
    if (bio !== undefined) updates.bio = bio;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates
    });

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(user)
    });
  })
);

// Change password (alias for /api/users/password)
router.put('/change-password',
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    res.json({ message: 'Password updated successfully' });
  })
);

// Only admin can delete users
router.delete('/user/:id',
  protect,
  checkRolesFor('deleteUser'),
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted successfully' });
  })
);

// ==================== PASSWORD RESET & EMAIL VERIFICATION ====================

// Forgot Password - Send reset email
router.post('/forgot-password',
  authOperationsLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Don't reveal if user exists for security
    if (!user) {
      return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = emailService.generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.username);

    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  })
);

// Reset Password - Verify token and update password
router.post('/reset-password',
  authOperationsLimiter,
  body('token').notEmpty().withMessage('Token is required'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('newPassword').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
  asyncHandler(async (req, res) => {
    const { token, password, newPassword } = req.body;
    const finalPassword = password || newPassword;

    if (!finalPassword || finalPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    await LogService.logAction('Password reset', null, user.id);

    res.json({ message: 'Password has been reset successfully' });
  })
);

// Verify Email - Verify email with token
router.post('/verify-email',
  authOperationsLimiter,
  body('token').notEmpty().withMessage('Token is required'),
  validate,
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark email as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null
      },
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true
      }
    });

    await LogService.logAction('Email verified', null, user.id);

    res.json({ 
      message: 'Email verified successfully',
      user: updatedUser
    });
  })
);

// Resend Verification Email
router.post('/resend-verification',
  authOperationsLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification token (valid for 24 hours)
    const verificationToken = emailService.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires
      }
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, user.username);

    res.json({ message: 'Verification email sent' });
  })
);

export default router;
