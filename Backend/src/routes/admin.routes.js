import express from "express";
const router = express.Router();
import { protect, authorize } from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { PrismaClient } from "@prisma/client";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";

const prisma = new PrismaClient();

// Example admin-only route
router.post("/admin-action", protect, authorize("admin"), (req, res) => {
    res.json({ message: "Admin action performed." });
});

// Get system stats
router.get("/stats", protect, authorize("admin"), asyncHandler(async (req, res) => {
    const [totalUsers, totalProjects, totalTasks] = await Promise.all([
        prisma.user.count(),
        Project.countDocuments(),
        Task.countDocuments()
    ]);
    res.json({ totalUsers, totalProjects, totalTasks });
}));

// Get all users (admin)
router.get("/users", protect, authorize("admin"), asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            role: true,
            isActive: true,
            isOnline: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
}));

// Update user role (admin)
router.put("/users/:id/role", protect, authorize("admin"), asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const role = String(req.body.role || 'USER').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
    const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            email: true,
            username: true,
            role: true
        }
    });
    res.json({ message: "User role updated", user });
}));

// Delete user (admin)
router.delete("/users/:id", protect, authorize("admin"), asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "User deleted successfully" });
}));

export default router;
