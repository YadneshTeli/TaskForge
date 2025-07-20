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
router.post("/create", protect, projectService.createProject);

// Get all projects for the logged-in user
router.get("/all", protect, projectService.getUserProjects);

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