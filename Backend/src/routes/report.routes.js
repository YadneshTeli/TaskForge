import express from "express";
const router = express.Router();
import PDFDocument from "pdfkit";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import { body, validationResult } from 'express-validator';
import { permissions } from '../config/roles.js';
import reportService from '../services/report.service.js';
import projectService from '../services/project.service.js';
import taskService from '../services/task.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function checkRolesFor(action) {
    return (req, res, next) => {
        const userRole = req.user?.role ? String(req.user.role).toLowerCase() : null;
        if (!userRole || !permissions[action]?.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

// Get summary of reports/analytics for current user
router.get("/", protect, asyncHandler(async (req, res) => {
    const { projects } = await projectService.getUserProjects(req.user.id);
    const userStats = await taskService.getUserTaskStats(req.user.id);
    res.json({
        reports: projects.map(p => ({
            projectId: p._id,
            name: p.name,
            status: p.status,
            stats: p.stats
        })),
        userStats
    });
}));

// Project performance report
router.get("/project/:projectId", protect, asyncHandler(async (req, res) => {
    const dashboardData = await projectService.getProjectDashboardData(req.params.projectId);
    res.json(dashboardData);
}));

// Team productivity report
router.get("/team", protect, asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        where: { isActive: true },
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            role: true,
            userStats: true
        }
    });
    res.json({
        team: users.map(u => ({
            id: u.id,
            name: u.fullName || u.username,
            email: u.email,
            role: u.role,
            tasksCompleted: u.userStats?.totalTasksCompleted || 0,
            tasksCreated: u.userStats?.totalTasksCreated || 0,
            efficiency: u.userStats?.productivityScore || 0
        }))
    });
}));

// User performance report
router.get("/user/:userId", protect, asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const stats = await taskService.getUserTaskStats(userId, true);
    res.json(stats);
}));

// Task completion trends
router.get("/task-trends", protect, asyncHandler(async (req, res) => {
    const { projectId } = req.query;
    if (projectId) {
        const analytics = await taskService.getTaskAnalytics(projectId, { groupBy: 'status' });
        return res.json({ trends: analytics });
    }
    const metrics = await prisma.taskMetrics.groupBy({
        by: ['status'],
        _count: { taskId: true }
    });
    res.json({
        trends: metrics.map(m => ({ status: m.status, count: m._count.taskId }))
    });
}));

// Time tracking report
router.get("/time-tracking", protect, asyncHandler(async (req, res) => {
    const { projectId } = req.query;
    if (projectId) {
        const metrics = await projectService.getProjectTaskMetrics(projectId, { includeUsers: true });
        return res.json({ timeTracking: metrics });
    }
    const metrics = await prisma.taskMetrics.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 50
    });
    res.json({ timeTracking: metrics });
}));

// Export report as PDF or CSV
router.get("/export/:projectId/:format?", protect, asyncHandler(async (req, res) => {
    const { projectId, format = 'pdf' } = req.params;
    if (format === 'csv') {
        const csv = `Project ID,Generated At\n${projectId},${new Date().toISOString()}\n`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=project_${projectId}.csv`);
        return res.send(csv);
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=project_${projectId}.pdf`);
    doc.fontSize(18).text(`Project Report: ${projectId}`);
    doc.moveDown();
    doc.fontSize(12).text("Generated at: " + new Date().toISOString());
    doc.pipe(res);
    doc.end();
}));

// Generate report file on disk (admin and manager)
const handleGenerateReport = [
    protect,
    checkRolesFor('report'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { projectId, format = 'pdf' } = req.body;
        const path = await reportService.generateReport({ projectId, format });
        res.json({ message: 'Report generated successfully', path, format });
    })
];

router.post('/report', ...handleGenerateReport);
router.post('/generate', ...handleGenerateReport);

export default router;
