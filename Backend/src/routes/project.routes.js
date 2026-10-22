import express from 'express';
const router = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
import projectService from '../services/project.service.js';
import uploadService from '../services/upload.service.js';
import reportService from '../services/report.service.js';
import notificationService from '../services/notification.service.js';
import commentService from '../services/comment.service.js';
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import { body, validationResult } from 'express-validator';
import { permissions } from '../config/roles.js';

// Role-based access control middleware
function checkRolesFor(action) {
    return (req, res, next) => {
        const userRole = req.user?.role ? String(req.user.role).toLowerCase() : null;
        if (!userRole || !permissions[action]?.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

// Create a new project (POST / or POST /create)
const handleCreateProject = asyncHandler(async (req, res) => {
    const projectData = {
        ...req.body,
        owner: req.user.id
    };
    const project = await projectService.createProject(projectData);
    res.status(201).json(project);
});

router.post("/", protect, handleCreateProject);
router.post("/create", protect, handleCreateProject);

// Get all projects for the logged-in user (GET / or GET /all)
const handleGetAllProjects = asyncHandler(async (req, res) => {
    const projects = await projectService.getUserProjects(req.user.id, req.query);
    res.json(projects);
});

router.get("/", protect, handleGetAllProjects);
router.get("/all", protect, handleGetAllProjects);

// Dashboard overview for viewer/all roles
router.get('/dashboard',
    protect,
    checkRolesFor('viewDashboard'),
    asyncHandler(async (req, res) => {
        const projects = await projectService.getUserProjects(req.user.id);
        res.json(projects);
    })
);

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

// Archive project
router.patch("/:id/archive", protect, asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(req.params.id, {
        status: 'archived',
        archivedAt: new Date()
    });
    res.json(project);
}));

// Restore archived project
router.patch("/:id/restore", protect, asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(req.params.id, {
        status: 'active',
        archivedAt: null
    });
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

// Add member to project (supports /members and /member)
const handleAddMember = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const project = await projectService.addMemberToProject(req.params.id, parseInt(userId, 10));
    res.json(project);
});
router.post("/:id/members", protect, handleAddMember);
router.post("/:id/member", protect, handleAddMember);

// Remove member from project (supports /members/:userId and /member/:userId)
const handleRemoveMember = asyncHandler(async (req, res) => {
    const project = await projectService.removeMemberFromProject(req.params.id, parseInt(req.params.userId, 10));
    res.json(project);
});
router.delete("/:id/members/:userId", protect, handleRemoveMember);
router.delete("/:id/member/:userId", protect, handleRemoveMember);

// Upload project file (admin or manager)
const handleUploadProjectFile = [
    protect,
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
];
router.post('/:id/upload', ...handleUploadProjectFile);
router.post('/project/:id/upload', ...handleUploadProjectFile);

// Generate project report (admin or manager)
const handleGenerateProjectReport = [
    protect,
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
];
router.post('/:id/report', ...handleGenerateProjectReport);
router.post('/project/:id/report', ...handleGenerateProjectReport);

// Notify project user (admin, manager, or user)
const handleNotifyProjectUser = [
    protect,
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
        const notification = await notificationService.createNotification(content, userId, { projectId });
        
        res.status(201).json({ 
            message: 'Notification sent successfully',
            notification
        });
    })
];
router.post('/:id/notify', ...handleNotifyProjectUser);
router.post('/project/:id/notify', ...handleNotifyProjectUser);

// Add project comment
const handleAddProjectComment = [
    protect,
    checkRolesFor('addComment'),
    asyncHandler(async (req, res) => {
        const comment = await commentService.createComment({
            content: req.body.content || req.body.text,
            projectId: req.params.id,
            author: req.user.id
        });
        res.status(201).json(comment);
    })
];
router.post('/:id/comment', ...handleAddProjectComment);
router.post('/project/:id/comment', ...handleAddProjectComment);

export default router;
