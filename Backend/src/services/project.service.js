// src/services/project.service.js
// Project service for handling project-related logic

const { PrismaClient } = require('@prisma/client');
const Project = require('../models/project.model');

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
    }
};
