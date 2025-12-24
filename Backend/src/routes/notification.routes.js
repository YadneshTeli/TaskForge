import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from '../utils/asyncHandler.js';
import notificationService from '../services/notification.service.js';

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

export default router;
