import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service for handling file uploads
export default {
    /**
     * Upload file to Cloudinary
     * @param {Object} file - Multer file object
     * @returns {Promise<string>} - URL of uploaded file
     */
    async uploadFile(file) {
        try {
            if (
                !process.env.CLOUDINARY_CLOUD_NAME ||
                process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name'
            ) {
                throw new Error('Cloudinary not configured, using local storage fallback');
            }

            // Upload to Cloudinary using buffer
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { 
                        resource_type: "auto",
                        folder: "taskforge"
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                
                uploadStream.end(file.buffer);
            });
            
            return result.secure_url;
        } catch (error) {
            console.warn('Using local upload fallback:', error.message);
            
            // Fallback to local storage if Cloudinary fails or is unconfigured
            const uploadsDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            const filename = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(uploadsDir, filename);
            await fs.promises.writeFile(filePath, file.buffer);
            
            return `/uploads/${filename}`;
        }
    }
};
