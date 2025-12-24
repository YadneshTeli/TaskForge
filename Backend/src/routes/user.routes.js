import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import userService from '../services/user.service.js';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';

// Get current user profile
router.get('/profile', 
    protect, 
    asyncHandler(async (req, res) => {
        const user = await userService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Remove sensitive data
        const { password, ...userWithoutPassword } = user.toObject();
        res.json(userWithoutPassword);
    })
);

// Update user profile
router.put('/profile',
    protect,
    body('fullName').optional().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
    validate,
    asyncHandler(async (req, res) => {
        const allowedUpdates = ['fullName', 'bio', 'profilePicture'];
        const updates = {};
        
        // Filter only allowed fields
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await userService.updateProfile(req.user.id, updates);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user.toObject();
        res.json({ 
            message: 'Profile updated successfully',
            user: userWithoutPassword 
        });
    })
);

// Reset/Change password
router.put('/password',
    protect,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    validate,
    asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await userService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.default.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Reset password
        await userService.resetPassword(req.user.id, newPassword);
        
        res.json({ message: 'Password updated successfully' });
    })
);

// Get user by ID (admin only - can be extended)
router.get('/:id',
    protect,
    asyncHandler(async (req, res) => {
        const user = await userService.getUserById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove sensitive data
        const { password, ...userWithoutPassword } = user.toObject();
        res.json(userWithoutPassword);
    })
);

export default router;
