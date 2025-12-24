import jwt from "jsonwebtoken";

const signToken = (payload, expiresIn = "15m") => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
const signRefreshToken = (payload, expiresIn = "30d") => jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

export { signToken, signRefreshToken, verifyToken, verifyRefreshToken };