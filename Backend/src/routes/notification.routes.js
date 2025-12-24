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
        const { content, userId } = req.body;
        
        // Use current user if no userId provided
        const targetUserId = userId || req.user.id;
        
        const notification = await notificationService.createNotification(content, targetUserId);
        res.status(201).json(notification);
    })
);

// Mark notification as seen
router.put('/:id/seen',
    protect,
    asyncHandler(async (req, res) => {
        const notification = await notificationService.markNotificationAsSeen(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    })
);

// Mark all notifications as seen
router.put('/mark-all-seen',
    protect,
    asyncHandler(async (req, res) => {
        const notifications = await notificationService.getUserNotifications(req.user.id);
        
        // Mark all as seen
        const updatePromises = notifications
            .filter(n => !n.seen)
            .map(n => notificationService.markNotificationAsSeen(n._id));
        
        await Promise.all(updatePromises);
        
        res.json({ message: 'All notifications marked as seen' });
    })
);

// ==================== NEW NOTIFICATION ENDPOINTS ====================

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

// Mark all notifications as read (PostgreSQL-based)
router.put('/mark-all-read',
    protect,
    asyncHandler(async (req, res) => {
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
    })
);

// Delete notification
router.delete('/:id',
    protect,
    asyncHandler(async (req, res) => {
        const notificationId = parseInt(req.params.id);

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

