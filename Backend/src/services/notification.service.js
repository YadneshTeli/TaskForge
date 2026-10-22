// src/services/notification.service.js
// Service for handling notification-related logic (PostgreSQL Prisma)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
    createNotification: async (content, userId, metadata = null, type = 'system_update') => {
        return await prisma.notification.create({
            data: {
                content,
                userId: parseInt(userId, 10),
                type,
                metadata: metadata || undefined,
                seen: false
            }
        });
    },
    markNotificationAsSeen: async (id) => {
        const parsedId = parseInt(id, 10);
        if (Number.isNaN(parsedId)) return null;
        try {
            return await prisma.notification.update({
                where: { id: parsedId },
                data: { seen: true }
            });
        } catch {
            return null;
        }
    },
    getUserNotifications: async (userId) => {
        return await prisma.notification.findMany({
            where: { userId: parseInt(userId, 10) },
            orderBy: { createdAt: 'desc' }
        });
    }
};
