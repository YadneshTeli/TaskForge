import express from "express";
const router = express.Router();
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import { permissions } from '../config/roles.js';
import uploadService from '../services/upload.service.js';

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

function checkRolesFor(action) {
    return (req, res, next) => {
        const userRole = req.user?.role ? String(req.user.role).toLowerCase() : null;
        if (!userRole || !permissions[action]?.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

// Single file upload (POST /upload or POST /)
const handleSingleUpload = [
    protect,
     upload.single("file"),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }
        const url = await uploadService.uploadFile(req.file);
        res.json({ url, filename: req.file.originalname });
    })
];

router.post("/upload", ...handleSingleUpload);
router.post("/", ...handleSingleUpload);

// Multiple files upload
router.post("/multiple",
    protect,
    checkRolesFor('upload'),
    upload.array("files", 10),
    asyncHandler(async (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Files are required' });
        }
        const uploadedFiles = await Promise.all(
            req.files.map(async (file) => ({
                url: await uploadService.uploadFile(file),
                filename: file.originalname
            }))
        );
        res.json({ files: uploadedFiles });
    })
);

export default router;
