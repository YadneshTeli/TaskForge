const router = require("express").Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { signToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

const { protect } = require("../middleware/auth.middleware");
const validation = require('../middleware/validation.middleware');
const validate = require('../utils/validate');
const LogService = require('../services/log.service');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('../middleware/rateLimit.middleware');
const { permissions } = require('../config/roles');

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
  checkRolesFor('register'),
  validation({
    email: [{ fn: validate.isEmail, message: "Invalid email" }],
    password: [{ fn: validate.minLength, args: [8], message: "Password too short" }],
    username: [{ fn: validate.isRequired, message: "Username required" }]
  }),
  protect,
  async (req, res) => {
    const { email, password, username } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, username } });
    const token = signToken({ id: user.id });
    res.json({ token });
  }
);

router.post('/login',
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    },
  protect,
  async (req, res) => {
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
  }
);

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const token = signToken({ id: payload.id });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

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

module.exports = router;