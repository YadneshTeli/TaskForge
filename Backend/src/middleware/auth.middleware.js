import { verifyToken } from "../utils/jwt.js";

export const decodeToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            req.user = verifyToken(token);
        } catch (err) {
            req.user = null;
        }
    }
    next();
};

export const protect = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    next();
};