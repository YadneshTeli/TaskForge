import express from 'express';
const router = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
import projectService from '../services/project.service.js';
import uploadService from '../services/upload.service.js';
import reportService from '../services/report.service.js';
import notificationService from '../services/notification.service.js';
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

// Error handling middleware
router.use((err, req, res, next) => {
    if (err) {
        res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    } else {
        next();
    }
});

// Create a new project
router.post("/create", protect, asyncHandler(async (req, res) => {
    const projectData = {
        ...req.body,
        owner: req.user.id
    };
    const project = await projectService.createProject(projectData);
    res.status(201).json(project);
}));

// Get all projects for the logged-in user
router.get("/all", protect, asyncHandler(async (req, res) => {
    const projects = await projectService.getUserProjects(req.user.id);
    res.json(projects);
}));

// Get project by ID
router.get("/:id", protect, asyncHandler(async (req, res) => {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
}));

// Get project analytics
router.get("/:id/analytics", protect, asyncHandler(async (req, res) => {
    const analytics = await projectService.getProjectDashboardData(req.params.id);
    res.json(analytics);
}));

// Update project
router.put("/:id", protect, asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(req.params.id, req.body);
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
}));

// Delete project
router.delete("/:id", protect, asyncHandler(async (req, res) => {
    const success = await projectService.deleteProject(req.params.id);
    if (!success) {
        return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
}));

// Add member to project
router.post("/:id/members", protect, asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const project = await projectService.addMemberToProject(req.params.id, userId);
    res.json(project);
}));

// Remove member from project
router.delete("/:id/members/:userId", protect, asyncHandler(async (req, res) => {
    const project = await projectService.removeMemberFromProject(req.params.id, req.params.userId);
    res.json(project);
}));

// Role-based access control middleware
function checkRolesFor(action) {
    return (req, res, next) => {
        if (!req.user || !permissions[action].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

// Upload project file (admin or manager)
router.post('/project/:id/upload',
    checkRolesFor('upload'),
    upload.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }
        
        const projectId = req.params.id;
        
        // Verify project exists
        const project = await projectService.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Upload file using upload service
        const fileUrl = await uploadService.uploadFile(req.file);
        
        res.status(200).json({ 
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.originalname
        });
    })
);

// Generate project report (admin or manager)
router.post('/project/:id/report',
    checkRolesFor('report'),
    body('format').optional().isIn(['pdf', 'csv']).withMessage('Format must be pdf or csv'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const projectId = req.params.id;
        const format = req.body.format || 'pdf';
        
        // Verify project exists
        const project = await projectService.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Generate report
        const reportPath = await reportService.generateReport({ projectId, format });
        
        res.status(200).json({ 
            message: 'Report generated successfully',
            path: reportPath,
            format
        });
    })
);

// Notify project user (admin, manager, or user)
router.post('/project/:id/notify',
    checkRolesFor('notify'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('content').notEmpty().withMessage('Content is required'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const projectId = req.params.id;
        const { userId, content } = req.body;
        
        // Verify project exists
        const project = await projectService.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Create notification
        const notification = await notificationService.createNotification(content, userId);
        
        res.status(201).json({ 
            message: 'Notification sent successfully',
            notification
        });
    })
);

// Only user and manager can add comments
router.post('/project/:id/comment',
    checkRolesFor('addComment'),
    (req, res, next) => {
        // ...existing add comment logic...
    }
);

// Only viewer can view dashboard
router.get('/dashboard',
    checkRolesFor('viewDashboard'),
    (req, res, next) => {
        // ...existing dashboard logic...
    }
);

export default router;