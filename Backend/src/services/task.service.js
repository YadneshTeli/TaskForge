// src/services/task.service.js
// Service for handling task-related logic with hybrid MongoDB + Prisma approach

const Task = require('../models/task.model');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TaskService {
    // MongoDB operations for core task functionality
    async createTask(taskData) {
        const task = await Task.create(taskData);
        
        // Sync to Prisma for analytics
        await this.syncTaskToPrisma(task);
        await this.updateProjectAnalytics(task.projectId);
        
        return task;
    }

    async getTasksByProject(projectId) {
        return await Task.find({ projectId })
            .populate('assignedTo', 'username email')
            .populate('comments.userId', 'username email')
            .lean();
    }

    async updateTask(taskId, updateData) {
        const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true })
            .populate('assignedTo', 'username email');
        
        if (task) {
            // Update analytics
            await this.syncTaskToPrisma(task);
            await this.updateProjectAnalytics(task.projectId);
        }
        
        return task;
    }

    async deleteTask(taskId) {
        const task = await Task.findById(taskId);
        if (task) {
            await Task.findByIdAndDelete(taskId);
            
            // Remove from analytics
            await prisma.taskMetrics.deleteMany({
                where: { taskId: taskId.toString() }
            });
            
            await this.updateProjectAnalytics(task.projectId);
            return true;
        }
        return false;
    }

    // Prisma operations for analytics
    async getTaskAnalytics(projectId) {
        return await prisma.taskMetrics.findMany({
            where: { projectId: parseInt(projectId) },
            include: {
                assignee: {
                    select: { id: true, username: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getUserTaskStats(userId) {
        return await prisma.userStats.findUnique({
            where: { userId: parseInt(userId) },
            include: {
                user: {
                    select: { id: true, username: true, email: true }
                }
            }
        });
    }

    async getProjectAnalytics(projectId) {
        return await prisma.projectAnalytics.findUnique({
            where: { projectId: parseInt(projectId) }
        });
    }

    // Helper methods for syncing data
    async syncTaskToPrisma(task) {
        const taskData = {
            taskId: task._id.toString(),
            projectId: parseInt(task.projectId) || 1, // Default project if not set
            title: task.title,
            status: task.status,
            priority: task.priority || 'medium',
            assignedTo: task.assignedTo ? parseInt(task.assignedTo) : null,
            dueDate: task.dueDate,
            completedAt: task.status === 'done' ? new Date() : null,
            updatedAt: new Date()
        };

        await prisma.taskMetrics.upsert({
            where: { taskId: task._id.toString() },
            update: taskData,
            create: taskData
        });
    }

    async updateProjectAnalytics(projectId) {
        const tasks = await Task.find({ projectId });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const pendingTasks = tasks.filter(t => t.status === 'todo').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
        const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

        const analyticsData = {
            projectId: parseInt(projectId) || 1,
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            overdueTasks,
            lastUpdated: new Date()
        };

        await prisma.projectAnalytics.upsert({
            where: { projectId: parseInt(projectId) || 1 },
            update: analyticsData,
            create: analyticsData
        });
    }

    async updateUserStats(userId) {
        const tasks = await Task.find({ assignedTo: userId });
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const pendingTasks = tasks.filter(t => t.status === 'todo').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
        const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

        const statsData = {
            userId: parseInt(userId),
            totalTasksCreated: tasks.length,
            totalTasksCompleted: completedTasks,
            totalTasksPending: pendingTasks,
            totalTasksInProgress: inProgressTasks,
            totalTasksOverdue: overdueTasks,
            lastActivityAt: new Date(),
            updatedAt: new Date()
        };

        await prisma.userStats.upsert({
            where: { userId: parseInt(userId) },
            update: statsData,
            create: statsData
        });
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

module.exports = new TaskService();
