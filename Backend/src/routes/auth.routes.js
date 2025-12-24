import express from "express";
const router = express.Router();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import { signToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import asyncHandler from '../utils/asyncHandler.js';
import emailService from '../utils/email.js';
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

import { protect } from "../middleware/auth.middleware.js";
import validate from '../middleware/validate.js';
import LogService from '../services/log.service.js';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from '../middleware/rateLimit.middleware.js';
import { permissions } from '../config/roles.js';
import expressRateLimit from 'express-rate-limit';

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

router.use(helmet());
router.use(xss());
router.use(rateLimit);

function checkRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

function checkRoles(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

function checkRolesFor(action) {
    return (req, res, next) => {
        if (!req.user || !permissions[action].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

// Only admin and manager can register
router.post(
  "/register",
  authLimiter, // Strict rate limiting for registration
  checkRolesFor('register'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('username').notEmpty().withMessage('Username is required'),
  validate,
  protect,
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, username } });
    const token = signToken({ id: user.id });
    res.json({ token });
  })
);

router.post('/login',
    authLimiter, // Strict rate limiting for login
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    },
  protect,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken({ id: user.id });
    const refreshToken = signRefreshToken({ id: user.id });
    res.cookie("refreshToken", refreshToken, cookieOptions);
    await LogService.logAction('User login', null);
    res.json({ token });
  })
);

router.post("/refresh-token", authOperationsLimiter, asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const token = signToken({ id: payload.id });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}));

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ message: "Logged out" });
});

// Only admin, manager, user, and viewer can view profile
router.get('/profile',
    checkRolesFor('view'),
    (req, res, next) => {
        // ...existing profile logic...
    }
);

// Only admin can delete users
router.delete('/user/:id',
    checkRolesFor('deleteUser'),
    (req, res, next) => {
        // ...existing delete user logic...
    }
);

// Only user and manager can update profile
router.put('/profile',
    checkRolesFor('updateProfile'),
    (req, res, next) => {
        // ...existing update profile logic...
    }
);

// ==================== NEW AUTHENTICATION ENDPOINTS ====================

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
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;

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
    const hashedPassword = await bcrypt.hash(password, 10);

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
