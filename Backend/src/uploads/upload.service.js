const path = require('path');
const fs = require('fs');

// Service for handling file uploads
module.exports = {
    async uploadFile(file) {
        // Example: Save file to local uploads directory
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
        const filePath = path.join(uploadsDir, file.originalname);
        await fs.promises.writeFile(filePath, file.buffer);
        return `/uploads/${file.originalname}`;
    }
};
