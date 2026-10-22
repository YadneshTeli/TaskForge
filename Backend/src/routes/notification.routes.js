import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import notificationService from '../services/notification.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user's notifications
router.get('/',
    protect,
    asyncHandler(async (req, res) => {
        const notifications = await notificationService.getUserNotifications(req.user.id);
        res.json(notifications);
    })
);

// Create notification (for testing/admin)
router.post('/',
    protect,
    asyncHandler(async (req, res) => {
        const { content, userId, type = 'system_update', metadata = null } = req.body;
        const targetUserId = userId ? parseInt(userId, 10) : req.user.id;
        
        const notification = await notificationService.createNotification(content, targetUserId, metadata, type);
        res.status(201).json(notification);
    })
);

// Get unread notification count
router.get('/unread-count',
    protect,
    asyncHandler(async (req, res) => {
        const count = await prisma.notification.count({
            where: {
                userId: req.user.id,
                seen: false
            }
        });

        res.json({ count });
    })
);

// Get notification preferences (alias for /api/users/notification-preferences)
router.get('/preferences',
    protect,
    asyncHandler(async (req, res) => {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { settings: true }
        });
        const settings = user?.settings || {};
        res.json({
            preferences: {
                email: settings.emailNotifications !== false,
                push: settings.pushNotifications !== false,
                inApp: settings.inAppNotifications !== false
            }
        });
    })
);

// Update notification preferences (alias for /api/users/notification-preferences)
router.put('/preferences',
    protect,
    asyncHandler(async (req, res) => {
        const { email, push, inApp } = req.body;
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { settings: true }
        });
        const currentSettings = currentUser?.settings || {};
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
        res.json({
            message: 'Notification preferences updated successfully',
            preferences: {
                email: user.settings.emailNotifications,
                push: user.settings.pushNotifications,
                inApp: user.settings.inAppNotifications
            }
        });
    })
);

// Mark all notifications as seen / read (supports PUT and PATCH on /mark-all-seen and /mark-all-read)
const handleMarkAllRead = asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
        where: {
            userId: req.user.id,
            seen: false
        },
        data: {
            seen: true
        }
    });

    res.json({ message: 'All notifications marked as read' });
});

router.put('/mark-all-seen', protect, handleMarkAllRead);
router.put('/mark-all-read', protect, handleMarkAllRead);
router.patch('/mark-all-read', protect, handleMarkAllRead);

// Clear all notifications for user
router.delete('/clear-all',
    protect,
    asyncHandler(async (req, res) => {
        await prisma.notification.deleteMany({
            where: { userId: req.user.id }
        });
        res.json({ message: 'All notifications cleared' });
    })
);

// Mark single notification as seen / read (supports PUT /:id/seen and PATCH /:id/read)
const handleMarkSingleRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markNotificationAsSeen(req.params.id);
    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
});

router.put('/:id/seen', protect, handleMarkSingleRead);
router.patch('/:id/read', protect, handleMarkSingleRead);

// Delete notification
router.delete('/:id',
    protect,
    asyncHandler(async (req, res) => {
        const notificationId = parseInt(req.params.id, 10);
        if (Number.isNaN(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' });
        }

        // Check if notification belongs to user
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.userId !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this notification' });
        }

        await prisma.notification.delete({
            where: { id: notificationId }
        });

        res.json({ message: 'Notification deleted successfully' });
    })
);

export default router;
