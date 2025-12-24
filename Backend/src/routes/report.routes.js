import express from "express";
const router = express.Router();
import PDFDocument from "pdfkit";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from '../middleware/rateLimit.middleware.js';
import { permissions } from '../config/roles.js';

router.use(helmet());
router.use(xss());
router.use(rateLimit);

router.get("/export/:projectId", protect, asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=project_${projectId}.pdf`);
    doc.text(`Project Report for Project ID: ${projectId}`);
    doc.text("Generated at: " + new Date().toISOString());
    doc.pipe(res);
    doc.end();
}));

function checkRolesFor(action) {
    return (req, res, next) => {
        if (!req.user || !permissions[action].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

// Only admin and manager can generate reports
router.post('/report',
    checkRolesFor('report'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // ...existing report logic...
    }
);

export default router;
