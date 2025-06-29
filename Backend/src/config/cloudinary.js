const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
module.exports = cloudinary;

// src/routes/upload.routes.js
const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect } = require("../middleware/auth.middleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", protect, upload.single("file"), async (req, res) => {
    const file = req.file;
    try {
        const result = await cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) return res.status(500).json({ error });
            res.json({ url: result.secure_url });
        }).end(file.buffer);
    } catch (err) {
        res.status(500).json({ message: "Upload failed", error: err });
    }
});

module.exports = router;
