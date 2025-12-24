import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import userService from '../services/user.service.js';
import { body, query } from 'express-validator';
import validate from '../middleware/validate.js';
import { PrismaClient } from '@prisma/client';
import emailService from '../utils/email.js';

const prisma = new PrismaClient();

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

// ==================== NEW USER ENDPOINTS ====================

// Search users by query (for autocomplete, mentions, etc.)
router.get('/search',
    protect,
    query('q').notEmpty().withMessage('Search query is required'),
    validate,
    asyncHandler(async (req, res) => {
        const { q } = req.query;
        
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                    { fullName: { contains: q, mode: 'insensitive' } }
                ],
                isActive: true
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                profilePicture: true,
                role: true
            },
            take: 20 // Limit results
        });

        res.json({ users });
    })
);

// Get all users with pagination and filtering
router.get('/',
    protect,
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['ADMIN', 'USER']).withMessage('Invalid role'),
    query('search').optional().isString(),
    validate,
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { role, search } = req.query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where = {
            isActive: true
        };

        if (role) {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                    profilePicture: true,
                    role: true,
                    emailVerified: true,
                    onboardingCompleted: true,
                    lastSeen: true,
                    lastLogin: true,
                    createdAt: true
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    })
);

// Complete onboarding
router.post('/complete-onboarding',
    protect,
    body('role').optional().isString(),
    body('teamName').optional().isString(),
    body('preferences').optional().isObject(),
    validate,
    asyncHandler(async (req, res) => {
        const { role, teamName, preferences } = req.body;
        
        const updates = {
            onboardingCompleted: true,
            onboardingStep: 5 // Completed all steps
        };

        if (preferences) {
            updates.settings = preferences;
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updates,
            select: {
                id: true,
                username: true,
                email: true,
                onboardingCompleted: true,
                onboardingStep: true,
                settings: true
            }
        });

        res.json({ 
            message: 'Onboarding completed successfully',
            user 
        });
    })
);

// Get onboarding status
router.get('/onboarding-status',
    protect,
    asyncHandler(async (req, res) => {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                onboardingCompleted: true,
                onboardingStep: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            completed: user.onboardingCompleted,
            currentStep: user.onboardingStep
        });
    })
);

// Get user settings
router.get('/settings',
    protect,
    asyncHandler(async (req, res) => {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                settings: true,
                emailVerified: true,
                onboardingCompleted: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            settings: user.settings || {},
            emailVerified: user.emailVerified,
            onboardingCompleted: user.onboardingCompleted
        });
    })
);

// Update user settings
router.put('/settings',
    protect,
    body('notifications').optional().isBoolean(),
    body('theme').optional().isIn(['light', 'dark', 'system']),
    body('language').optional().isString(),
    validate,
    asyncHandler(async (req, res) => {
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { settings: true }
        });

        // Merge new settings with existing
        const currentSettings = currentUser.settings || {};
        const updatedSettings = { ...currentSettings, ...req.body };

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { settings: updatedSettings },
            select: {
                id: true,
                settings: true
            }
        });

        res.json({ 
            message: 'Settings updated successfully',
            settings: user.settings 
        });
    })
);

// Get user statistics
router.get('/stats',
    protect,
    asyncHandler(async (req, res) => {
        const stats = await prisma.userStats.findUnique({
            where: { userId: req.user.id }
        });

        if (!stats) {
            // Return default stats if none exist
            return res.json({
                totalProjectsOwned: 0,
                totalProjectsJoined: 0,
                totalTasksCreated: 0,
                totalTasksCompleted: 0,
                totalTasksInProgress: 0,
                totalComments: 0,
                productivity: 0
            });
        }

        // Calculate productivity percentage
        const productivity = stats.totalTasksCreated > 0
            ? Math.round((stats.totalTasksCompleted / stats.totalTasksCreated) * 100)
            : 0;

        res.json({
            ...stats,
            productivity
        });
    })
);

// Invite user to platform/project
router.post('/invite',
    protect,
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').optional().isString(),
    body('projectId').optional().isString(),
    validate,
    asyncHandler(async (req, res) => {
        const { email, role = 'member', projectId } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check for existing pending invitation
        const existingInvite = await prisma.invitation.findFirst({
            where: {
                email,
                status: 'pending',
                expiresAt: { gt: new Date() }
            }
        });

        if (existingInvite) {
            return res.status(400).json({ message: 'An invitation has already been sent to this email' });
        }

        // Generate invitation token (valid for 7 days)
        const token = emailService.generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const invitation = await prisma.invitation.create({
            data: {
                email,
                role,
                projectId,
                invitedById: req.user.id,
                token,
                expiresAt
            },
            include: {
                invitedBy: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        });

        // Send invitation email
        await emailService.sendInvitationEmail(
            email,
            token,
            invitation.invitedBy.username,
            projectId ? 'Project' : null
        );

        res.json({ 
            message: 'Invitation sent successfully',
            invitation: {
                id: invitation.id,
                email: invitation.email,
                role: invitation.role,
                expiresAt: invitation.expiresAt
            }
        });
    })
);

// Get notification preferences
router.get('/notification-preferences',
    protect,
    asyncHandler(async (req, res) => {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { settings: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract notification preferences from settings
        const settings = user.settings || {};
        const preferences = {
            email: settings.emailNotifications !== false, // default true
            push: settings.pushNotifications !== false, // default true
            inApp: settings.inAppNotifications !== false // default true
        };

        res.json({ preferences });
    })
);

// Update notification preferences
router.put('/notification-preferences',
    protect,
    body('email').optional().isBoolean().withMessage('Email preference must be a boolean'),
    body('push').optional().isBoolean().withMessage('Push preference must be a boolean'),
    body('inApp').optional().isBoolean().withMessage('In-app preference must be a boolean'),
    validate,
    asyncHandler(async (req, res) => {
        const { email, push, inApp } = req.body;

        // Get current settings
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { settings: true }
        });

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentSettings = currentUser.settings || {};
        
        // Update notification preferences
        const updatedSettings = {
            ...currentSettings,
            emailNotifications: email !== undefined ? email : currentSettings.emailNotifications !== false,
            pushNotifications: push !== undefined ? push : currentSettings.pushNotifications !== false,
            inAppNotifications: inApp !== undefined ? inApp : currentSettings.inAppNotifications !== false
        };

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { settings: updatedSettings },
            select: { settings: true }
        });

        const preferences = {
            email: user.settings.emailNotifications,
            push: user.settings.pushNotifications,
            inApp: user.settings.inAppNotifications
        };

        res.json({ 
            message: 'Notification preferences updated successfully',
            preferences 
        });
    })
);

export default router;

