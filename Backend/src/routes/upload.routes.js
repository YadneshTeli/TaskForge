const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect } = require("../middleware/auth.middleware");
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('../middleware/rateLimit.middleware');
const { permissions } = require('../config/roles');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(helmet());
router.use(xss());
router.use(rateLimit);

function checkRolesFor(action) {
    return (req, res, next) => {
        if (!req.user || !permissions[action].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

// Only admin and manager can upload
router.post("/upload", protect, checkRolesFor('upload'), upload.single("file"),
    body('file').custom((value, { req }) => {
        if (!req.file) throw new Error('File is required');
        // Add more file validation if needed
        return true;
    }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const file = req.file;
        try {
            const result = await cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
                if (error) return res.status(500).json({ error });
                res.json({ url: result.secure_url });
            }).end(file.buffer);
        } catch (err) {
            res.status(500).json({ message: "Upload failed", error: err });
        }
    }
);

module.exports = router;