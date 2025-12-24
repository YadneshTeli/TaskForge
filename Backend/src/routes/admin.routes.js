import express from "express";
const router = express.Router();
import { protect, authorize } from "../middleware/auth.middleware.js";

// Example admin-only route
router.post("/admin-action", protect, authorize("admin"), (req, res) => {
    // Only accessible by users with role 'admin'
    res.json({ message: "Admin action performed." });
});

export default router;
