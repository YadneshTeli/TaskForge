import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

// Example admin-only route
router.post("/admin-action", protect, role(["admin"]), (req, res) => {
    // Only accessible by users with role 'admin'
    res.json({ message: "Admin action performed." });
});

export default router;
