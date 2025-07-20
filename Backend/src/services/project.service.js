// src/services/project.service.js
// Project service for handling project-related logic

const { PrismaClient } = require('@prisma/client');
const Project = require('../models/project.model');
const uploadService = require('../uploads/upload.service');
const reportService = require('../reports/report.service');
const notificationService = require('../notifications/notification.service');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

module.exports = {
    createProject: async (req, res) => {
        const { name, description, dueDate } = req.body;
        const ownerId = req.user.id;
        try {
            // If using Prisma
            const project = await prisma.project.create({
                data: { name, description, dueDate, ownerId }
            });
            res.json(project);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getUserProjects: async (req, res) => {
        const ownerId = req.user.id;
        try {
            const projects = await prisma.project.findMany({ where: { ownerId } });
            res.json(projects);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    generatePdfReport: async (req, res) => {
        // Placeholder for PDF generation logic
        res.status(501).json({ message: 'PDF report generation not implemented yet.' });
    },
    uploadProjectFile: async (req, res) => {
        try {
            const file = req.file; // Assuming multer or similar middleware
            const url = await uploadService.uploadFile(file);
            res.json({ url });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    generateProjectReport: async (req, res) => {
        try {
            const { projectId } = req.body;
            const reportPath = await reportService.generateReport({ projectId });
            res.json({ reportPath });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    notifyProjectUser: async (req, res) => {
        try {
            const { userId, content } = req.body;
            await notificationService.sendNotification(userId, content);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Example Express route integrations
    registerRoutes: (router) => {
        // Upload project file
        router.post('/project/:id/upload', upload.single('file'), async (req, res) => {
            await module.exports.uploadProjectFile(req, res);
        });

        // Generate project report
        router.post('/project/:id/report', async (req, res) => {
            req.body.projectId = req.params.id;
            await module.exports.generateProjectReport(req, res);
        });

        // Notify project user
        router.post('/project/:id/notify', async (req, res) => {
            await module.exports.notifyProjectUser(req, res);
        });
    }
};
