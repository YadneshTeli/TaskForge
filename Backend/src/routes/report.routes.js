const router = require("express").Router();
const PDFDocument = require("pdfkit");
const { protect } = require("../middleware/auth.middleware");
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('../middleware/rateLimit.middleware');
const { permissions } = require('../config/roles');

router.use(helmet());
router.use(xss());
router.use(rateLimit);

router.get("/export/:projectId", protect, async (req, res) => {
    const { projectId } = req.params;
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=project_${projectId}.pdf`);
    doc.text(`Project Report for Project ID: ${projectId}`);
    doc.text("Generated at: " + new Date().toISOString());
    doc.pipe(res);
    doc.end();
});

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

module.exports = router;
