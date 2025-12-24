import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Service for handling notifications
export default {
    async sendNotification(userId, content) {
        // Create a notification in the database
        return await prisma.notification.create({
            data: {
                userId,
                content,
                seen: false,
                createdAt: new Date().toISOString()
            }
        });
    },

    async getUserNotifications(userId) {
        // Fetch all notifications for a user
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    },

    async markNotificationAsSeen(id) {
        // Mark a notification as seen
        return await prisma.notification.update({
            where: { id },
            data: { seen: true }
        });
    }
};
