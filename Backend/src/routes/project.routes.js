const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const projectService = require('../services/project.service');
const { protect } = require("../middleware/auth.middleware");
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('../middleware/rateLimit.middleware');
const { permissions } = require('../config/roles');

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
router.post("/create", protect, async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            owner: req.user.id
        };
        const project = await projectService.createProject(projectData);
        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all projects for the logged-in user
router.get("/all", protect, async (req, res) => {
    try {
        const projects = await projectService.getUserProjects(req.user.id);
        res.json(projects);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get project by ID
router.get("/:id", protect, async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get project analytics
router.get("/:id/analytics", protect, async (req, res) => {
    try {
        const analytics = await projectService.getProjectDashboardData(req.params.id);
        res.json(analytics);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update project
router.put("/:id", protect, async (req, res) => {
    try {
        const project = await projectService.updateProject(req.params.id, req.body);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete project
router.delete("/:id", protect, async (req, res) => {
    try {
        const success = await projectService.deleteProject(req.params.id);
        if (!success) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add member to project
router.post("/:id/members", protect, async (req, res) => {
    try {
        const { userId } = req.body;
        const project = await projectService.addMemberToProject(req.params.id, userId);
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove member from project
router.delete("/:id/members/:userId", protect, async (req, res) => {
    try {
        const project = await projectService.removeMemberFromProject(req.params.id, req.params.userId);
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

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
    body('file').custom((value, { req }) => {
        if (!req.file) throw new Error('File is required');
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        projectService.uploadProjectFile(req, res);
    }
);

// Generate project report (admin or manager)
router.post('/project/:id/report',
    checkRolesFor('report'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        req.body.projectId = req.params.id;
        projectService.generateProjectReport(req, res);
    }
);

// Notify project user (admin, manager, or user)
router.post('/project/:id/notify',
    checkRolesFor('notify'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('content').notEmpty().withMessage('Content is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        projectService.notifyProjectUser(req, res);
    }
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

module.exports = router;