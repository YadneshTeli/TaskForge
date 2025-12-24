// src/services/task.service.js
// Service for handling task-related logic with hybrid MongoDB + Prisma approach

import Task from '../models/task.model.js';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

class TaskService {
    // MongoDB operations for core task functionality
    async createTask(taskData) {
        try {
            const task = await Task.create(taskData);
            
            // Sync to Prisma for analytics
            await this.syncTaskToPrisma(task);
            await this.updateProjectAnalytics(task.projectId);
            
            return task;
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new ValidationError('Task validation failed', Object.values(error.errors));
            }
            throw new DatabaseError('Failed to create task', error);
        }
    }

    async getTasksByProject(projectId) {
        try {
            return await Task.find({ projectId }).lean();
        } catch (error) {
            throw new DatabaseError('Failed to retrieve tasks', error);
        }
    }

    async updateTask(taskId, updateData) {
        try {
            const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
            
            if (!task) {
                throw new NotFoundError('Task', taskId);
            }
            
            // Update analytics
            await this.syncTaskToPrisma(task);
            
            return task;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            if (error.name === 'ValidationError') {
                throw new ValidationError('Task validation failed', Object.values(error.errors));
            }
            throw new DatabaseError('Failed to update task', error);
        }
    }

    async deleteTask(taskId) {
        try {
            const task = await Task.findById(taskId);
            
            if (!task) {
                throw new NotFoundError('Task', taskId);
            }
            
            await Task.findByIdAndDelete(taskId);
            
            // Remove from analytics
            await prisma.taskMetrics.deleteMany({
                where: { taskId: taskId.toString() }
            });
            
            return true;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to delete task', error);
        }
    }

    // Prisma operations for analytics
    async getTaskAnalytics(projectId) {
        try {
            return await prisma.taskMetrics.findMany({
                where: { projectId: projectId.toString() },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            throw new DatabaseError('Failed to retrieve task analytics', error);
        }
    }

    async getUserTaskStats(userId) {
        try {
            return await prisma.userStats.findUnique({
                where: { userId: userId }
            });
        } catch (error) {
            throw new DatabaseError('Failed to retrieve user task stats', error);
        }
    }

    async getProjectAnalytics(projectId) {
        try {
            return await prisma.projectAnalytics.findUnique({
                where: { projectId: projectId.toString() }
            });
        } catch (error) {
            throw new DatabaseError('Failed to retrieve project analytics', error);
        }
    }

    // Helper methods for syncing data
    async syncTaskToPrisma(task) {
        try {
            const taskData = {
                taskId: task._id.toString(),
                projectId: task.projectId.toString(),
                userId: task.assignedTo || null,
                status: task.status,
                timeSpent: 0, // Can be calculated from logs if needed
                completedAt: task.status === 'done' ? new Date() : null,
                updatedAt: new Date(),
                createdAt: task.createdAt || new Date()
            };

            await prisma.taskMetrics.upsert({
                where: { taskId: task._id.toString() },
                update: taskData,
                create: taskData
            });
        } catch (error) {
            console.error('Failed to sync task to Prisma:', error);
            // Don't throw here to avoid breaking the main operation
        }
    }

    async updateProjectAnalytics(projectId) {
        // This is now handled by the Project model's post-save hook
        // Keep empty for backward compatibility
    }

    async updateUserStats(userId) {
        try {
            const tasks = await Task.find({ assignedTo: userId });
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

            const statsData = {
                totalTasksCreated: tasks.length,
                totalTasksCompleted: completedTasks,
                totalTasksInProgress: inProgressTasks,
                lastActivityAt: new Date(),
                updatedAt: new Date()
            };

            await prisma.userStats.upsert({
                where: { userId: userId },
                update: statsData,
                create: {
                    userId: userId,
                    ...statsData
                }
            });
        } catch (error) {
            console.error('Failed to update user stats:', error);
            // Don't throw here to avoid breaking the main operation
        }
    }

    // Legacy methods for backward compatibility
    async assignTaskToUser(taskId, userId) {
        return await this.updateTask(taskId, { assignedTo: userId });
    }
    
    async unassignTaskFromUser(taskId) {
        return await this.updateTask(taskId, { assignedTo: null });
    }
    
    async updateTaskStatus(taskId, status) {
        return await this.updateTask(taskId, { status });
    }
    
    async updateTaskDueDate(taskId, dueDate) {
        return await this.updateTask(taskId, { dueDate });
    }
    
    async updateTaskTitle(taskId, title) {
        return await this.updateTask(taskId, { title });
    }
    
    async updateTaskDescription(taskId, description) {
        return await this.updateTask(taskId, { description });
    }
}

export default new TaskService();
