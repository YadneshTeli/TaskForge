// src/services/notification.service.js
// Service for handling notification-related logic

import Notification from '../models/notification.model.js';

export default {
    createNotification: async (content, userId) => {
        const notification = new Notification({
            content,
            user: userId
        });
        return await notification.save();
    },
    markNotificationAsSeen: async (id) => {
        return await Notification.findByIdAndUpdate(id, { seen: true }, { new: true });
    },
    getUserNotifications: async (userId) => {
        return await Notification.find({ user: userId });
    }
};
