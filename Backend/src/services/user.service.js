// src/services/user.service.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default {
    updateProfile: async (id, updates) => {
        return await prisma.user.update({
            where: { id: parseInt(id) },
            data: updates
        });
    },
    resetPassword: async (id, newPassword) => {
        // Password strength check
        if (!newPassword || newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            throw new Error('Password must be at least 8 characters, include a number and an uppercase letter.');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        return await prisma.user.update({
            where: { id: parseInt(id) },
            data: { password: hashed }
        });
    },
    getUserById: async (id) => {
        return await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });
    },
    createUser: async (userData) => {
        return await prisma.user.create({
            data: userData
        });
    },
    getAllUsers: async () => {
        return await prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                profilePicture: true,
                role: true,
                isOnline: true,
                lastSeen: true,
                createdAt: true
            }
        });
    }
};
