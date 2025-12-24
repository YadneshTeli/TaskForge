import express from "express";
const router = express.Router();
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from '../middleware/rateLimit.middleware.js';
import { permissions } from '../config/roles.js';

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
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const file = req.file;
        const result = await cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) return res.status(500).json({ error });
            res.json({ url: result.secure_url });
        }).end(file.buffer);
    })
);

export default router;