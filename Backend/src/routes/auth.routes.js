const router = require("express").Router();
const { PrismaClient } = require('@prisma/client');
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

router.post(
  "/register",
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

router.post(
  "/login",
  validation({
    email: [{ fn: validate.isEmail, message: "Invalid email" }],
    password: [{ fn: validate.isRequired, message: "Password required" }]
  }),
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

module.exports = router;