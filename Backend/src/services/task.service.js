// src/services/task.service.js
// Service for handling task-related logic with hybrid MongoDB + Prisma approach
// Optimized with connection pooling, batch operations, and query optimization

import Task from '../models/task.model.js';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

// Singleton PrismaClient with optimized configuration
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
});

// Connection pool management
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

// Common field selections for optimization
const TASK_METRICS_SELECT = {
    taskId: true,
    projectId: true,
    userId: true,
    status: true,
    timeSpent: true,
    completedAt: true,
    createdAt: true,
    updatedAt: true
};

const USER_STATS_SELECT = {
    userId: true,
    totalTasksCreated: true,
    totalTasksCompleted: true,
    totalTasksInProgress: true,
    totalTimeSpent: true,
    avgCompletionTime: true,
    productivityScore: true,
    lastActivityAt: true
};

class TaskService {
    // MongoDB operations for core task functionality with optimization
    async createTask(taskData) {
        try {
            const task = await Task.create(taskData);
            
            // Async operations in parallel for better performance
            await Promise.all([
                this.syncTaskToPrisma(task),
                this.updateProjectAnalytics(task.projectId),
                task.assignedTo ? this.updateUserStats(task.assignedTo) : Promise.resolve()
            ]);
            
            return task;
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new ValidationError('Task validation failed', Object.values(error.errors));
            }
            throw new DatabaseError('Failed to create task', error);
        }
    }

    async getTasksByProject(projectId, options = {}) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                status, 
                assignedTo, 
                priority,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                includeMetrics = false
            } = options;
            
            // Build query with filters
            const query = { projectId };
            if (status) query.status = status;
            if (assignedTo) query.assignedTo = assignedTo;
            if (priority) query.priority = priority;
            
            const skip = (page - 1) * limit;
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
            
            // Parallel execution for better performance
            const [tasks, total] = await Promise.all([
                Task.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Task.countDocuments(query)
            ]);
            
            // Optionally include metrics from Prisma
            if (includeMetrics && tasks.length > 0) {
                const taskIds = tasks.map(t => t._id.toString());
                const metrics = await prisma.taskMetrics.findMany({
                    where: { taskId: { in: taskIds } },
                    select: TASK_METRICS_SELECT
                });
                
                const metricsMap = new Map(metrics.map(m => [m.taskId, m]));
                tasks.forEach(task => {
                    task.metrics = metricsMap.get(task._id.toString());
                });
            }
            
            return {
                tasks,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new DatabaseError('Failed to retrieve tasks', error);
        }
    }

    async updateTask(taskId, updateData) {
        try {
            const oldTask = await Task.findById(taskId).lean();
            
            if (!oldTask) {
                throw new NotFoundError('Task', taskId);
            }
            
            const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
            
            // Optimize: Only update analytics if relevant fields changed
            const analyticsFields = ['status', 'assignedTo', 'dueDate'];
            const shouldUpdateAnalytics = analyticsFields.some(field => 
                updateData[field] !== undefined && updateData[field] !== oldTask[field]
            );
            
            if (shouldUpdateAnalytics) {
                const updates = [
                    this.syncTaskToPrisma(task),
                    this.updateProjectAnalytics(task.projectId)
                ];
                
                // Update user stats if assignedTo changed
                if (updateData.assignedTo !== undefined) {
                    if (oldTask.assignedTo) updates.push(this.updateUserStats(oldTask.assignedTo));
                    if (task.assignedTo) updates.push(this.updateUserStats(task.assignedTo));
                }
                
                await Promise.all(updates);
            } else {
                // Just sync the task if no analytics impact
                await this.syncTaskToPrisma(task);
            }
            
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

    // Prisma operations for analytics with optimization
    async getTaskAnalytics(projectId, options = {}) {
        try {
            const { groupBy, status, dateFrom, dateTo } = options;
            
            const where = {
                projectId: projectId.toString(),
                ...(status && { status }),
                ...(dateFrom && dateTo && {
                    createdAt: {
                        gte: new Date(dateFrom),
                        lte: new Date(dateTo)
                    }
                })
            };
            
            if (groupBy === 'status') {
                // Use aggregation for better performance
                const statusCounts = await prisma.taskMetrics.groupBy({
                    by: ['status'],
                    where,
                    _count: { taskId: true },
                    _avg: { timeSpent: true }
                });
                
                return statusCounts.map(item => ({
                    status: item.status,
                    count: item._count.taskId,
                    avgTimeSpent: item._avg.timeSpent || 0
                }));
            }
            
            if (groupBy === 'user') {
                // Group by user with aggregations
                const userMetrics = await prisma.taskMetrics.groupBy({
                    by: ['userId'],
                    where,
                    _count: { taskId: true },
                    _sum: { timeSpent: true }
                });
                
                return userMetrics.map(item => ({
                    userId: item.userId,
                    taskCount: item._count.taskId,
                    totalTimeSpent: item._sum.timeSpent || 0
                }));
            }
            
            // Default: return all metrics with strategic selection
            return await prisma.taskMetrics.findMany({
                where,
                select: TASK_METRICS_SELECT,
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            throw new DatabaseError('Failed to retrieve task analytics', error);
        }
    }

    async getUserTaskStats(userId, includeHistory = false) {
        try {
            const stats = await prisma.userStats.findUnique({
                where: { userId },
                select: USER_STATS_SELECT
            });
            
            if (!stats) {
                // Return default stats if not found
                return {
                    userId,
                    totalTasksCreated: 0,
                    totalTasksCompleted: 0,
                    totalTasksInProgress: 0,
                    totalTimeSpent: 0,
                    avgCompletionTime: 0,
                    productivityScore: 0,
                    lastActivityAt: null
                };
            }
            
            // Optionally include task history
            if (includeHistory) {
                stats.taskHistory = await prisma.taskMetrics.findMany({
                    where: { userId },
                    select: TASK_METRICS_SELECT,
                    orderBy: { updatedAt: 'desc' },
                    take: 20
                });
            }
            
            return stats;
        } catch (error) {
            throw new DatabaseError('Failed to retrieve user task stats', error);
        }
    }

    // Helper methods for syncing data with optimization
    async syncTaskToPrisma(task) {
        try {
            const taskData = {
                taskId: task._id.toString(),
                projectId: task.projectId.toString(),
                userId: task.assignedTo || null,
                status: task.status,
                timeSpent: task.timeSpent || 0,
                completedAt: task.status === 'done' ? (task.completedAt || new Date()) : null,
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
            // Don't throw to avoid breaking main operation
        }
    }

    async updateProjectAnalytics(projectId) {
        // Delegate to project service to avoid circular dependency
        // This is a lightweight trigger that the project service handles
        try {
            // Use a lightweight update trigger
            await prisma.projectAnalytics.update({
                where: { projectId: projectId.toString() },
                data: { lastUpdated: new Date() }
            }).catch(() => {
                // Project analytics might not exist yet, ignore
            });
        } catch (error) {
            // Silent fail to avoid breaking task operations
        }
    }

    async updateUserStats(userId) {
        try {
            // Optimize: Use aggregation instead of fetching all tasks
            const [totalTasks, completedTasks, inProgressTasks] = await Promise.all([
                Task.countDocuments({ assignedTo: userId }),
                Task.countDocuments({ assignedTo: userId, status: 'done' }),
                Task.countDocuments({ assignedTo: userId, status: 'in-progress' })
            ]);
            
            // Get time metrics from Prisma
            const timeMetrics = await prisma.taskMetrics.aggregate({
                where: { 
                    userId,
                    completedAt: { not: null }
                },
                _sum: { timeSpent: true },
                _avg: { timeSpent: true }
            });

            const statsData = {
                totalTasksCreated: totalTasks,
                totalTasksCompleted: completedTasks,
                totalTasksInProgress: inProgressTasks,
                totalTimeSpent: timeMetrics._sum.timeSpent || 0,
                avgCompletionTime: timeMetrics._avg.timeSpent || 0,
                productivityScore: completedTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
                lastActivityAt: new Date(),
                updatedAt: new Date()
            };

            await prisma.userStats.upsert({
                where: { userId },
                update: statsData,
                create: {
                    userId,
                    ...statsData
                }
            });
        } catch (error) {
            console.error('Failed to update user stats:', error);
            // Don't throw to avoid breaking main operation
        }
    }
    
    // Batch operations for better performance
    async batchCreateTasks(tasksData) {
        try {
            const tasks = await Task.insertMany(tasksData);
            
            // Sync all tasks to Prisma in parallel
            await Promise.all(tasks.map(task => this.syncTaskToPrisma(task)));
            
            return tasks;
        } catch (error) {
            throw new DatabaseError('Failed to batch create tasks', error);
        }
    }
    
    async batchUpdateTasks(updates) {
        try {
            const operations = updates.map(({ taskId, data }) => 
                Task.findByIdAndUpdate(taskId, data, { new: true })
            );
            
            const tasks = await Promise.all(operations);
            
            // Sync updated tasks to Prisma
            await Promise.all(tasks.map(task => task && this.syncTaskToPrisma(task)));
            
            return tasks.filter(Boolean);
        } catch (error) {
            throw new DatabaseError('Failed to batch update tasks', error);
        }
    }
    
    async batchDeleteTasks(taskIds) {
        try {
            // Use transaction for atomicity
            await prisma.$transaction(async (tx) => {
                await tx.taskMetrics.deleteMany({
                    where: { taskId: { in: taskIds.map(id => id.toString()) } }
                });
            });
            
            await Task.deleteMany({ _id: { $in: taskIds } });
            
            return true;
        } catch (error) {
            throw new DatabaseError('Failed to batch delete tasks', error);
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
