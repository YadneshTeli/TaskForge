// src/services/project.service.js
// Project service for handling project-related logic with hybrid MongoDB + Prisma approach
// Optimized with connection pooling, batch operations, and strategic query optimization

import { PrismaClient } from '@prisma/client';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Comment from '../models/comment.model.js';
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
const USER_SELECT = {
    id: true,
    username: true,
    email: true,
    fullName: true,
    avatar: true
};

const PROJECT_ANALYTICS_SELECT = {
    projectId: true,
    totalTasks: true,
    completedTasks: true,
    inProgressTasks: true,
    pendingTasks: true,
    overdueTasks: true,
    totalMembers: true,
    totalComments: true,
    totalTimeSpent: true,
    avgTaskCompletionTime: true,
    productivityScore: true,
    completionRate: true,
    lastUpdated: true
};

class ProjectService {
    // MongoDB operations for core project functionality
    async createProject(projectData) {
        try {
            const project = await Project.create(projectData);
            
            // Initialize analytics in Prisma
            await this.initializeProjectAnalytics(project._id, project.owner);
            
            return project;
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new ValidationError('Project validation failed', Object.values(error.errors));
            }
            throw new DatabaseError('Failed to create project', error);
        }
    }

    async getProjectById(projectId, options = {}) {
        try {
            const project = await Project.findById(projectId).lean();
            
            if (!project) {
                throw new NotFoundError('Project', projectId);
            }
            
            // Only populate user data if requested (lazy loading)
            if (options.includeUsers !== false) {
                // Optimize: Single query for all users instead of separate queries
                const allUserIds = [project.owner, ...project.members].filter(Boolean);
                
                if (allUserIds.length > 0) {
                    const users = await prisma.user.findMany({
                        where: { id: { in: allUserIds } },
                        select: USER_SELECT
                    });
                    
                    // Map users for faster lookup
                    const userMap = new Map(users.map(u => [u.id, u]));
                    
                    project.ownerData = userMap.get(project.owner) || null;
                    project.membersData = project.members.map(id => userMap.get(id)).filter(Boolean);
                }
            }
            
            // Optionally include analytics
            if (options.includeAnalytics) {
                project.analytics = await this.getProjectAnalytics(projectId);
            }
            
            return project;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to retrieve project', error);
        }
    }

    async getUserProjects(userId, options = {}) {
        try {
            const { page = 1, limit = 20, status, sortBy = 'updatedAt', sortOrder = 'desc' } = options;
            
            const query = {
                $or: [
                    { owner: userId },
                    { members: userId }
                ]
            };
            
            // Add status filter if provided
            if (status) {
                query.status = status;
            }
            
            const skip = (page - 1) * limit;
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
            
            // Parallel execution for better performance
            const [projects, total] = await Promise.all([
                Project.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Project.countDocuments(query)
            ]);
            
            return {
                projects,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new DatabaseError('Failed to retrieve user projects', error);
        }
    }

    async updateProject(projectId, updateData) {
        try {
            const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true });
            
            if (!project) {
                throw new NotFoundError('Project', projectId);
            }
            
            await this.updateProjectAnalytics(projectId);
            
            return project;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            if (error.name === 'ValidationError') {
                throw new ValidationError('Project validation failed', Object.values(error.errors));
            }
            throw new DatabaseError('Failed to update project', error);
        }
    }

    async deleteProject(projectId) {
        try {
            const project = await Project.findById(projectId);
            
            if (!project) {
                throw new NotFoundError('Project', projectId);
            }
            
            const projectIdStr = projectId.toString();
            
            // Use transaction for atomicity in PostgreSQL operations
            await prisma.$transaction(async (tx) => {
                // Batch delete operations in Prisma
                await Promise.all([
                    tx.projectAnalytics.deleteMany({ where: { projectId: projectIdStr } }),
                    tx.taskMetrics.deleteMany({ where: { projectId: projectIdStr } }),
                    tx.projectMember.deleteMany({ where: { projectId: projectIdStr } })
                ]);
            });
            
            // MongoDB operations - run in parallel for better performance
            await Promise.all([
                Task.deleteMany({ projectId }),
                Comment.deleteMany({ projectId }),
                Project.findByIdAndDelete(projectId)
            ]);
            
            return true;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to delete project', error);
        }
    }

    async addMemberToProject(projectId, userId) {
        try {
            // Parallel execution: Update MongoDB and check user existence
            const [project, userExists] = await Promise.all([
                Project.findByIdAndUpdate(
                    projectId,
                    { $addToSet: { members: userId } },
                    { new: true }
                ),
                prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
            ]);
            
            if (!project) {
                throw new NotFoundError('Project', projectId);
            }
            
            if (!userExists) {
                throw new NotFoundError('User', userId);
            }
            
            // Use upsert to handle duplicates gracefully
            await prisma.projectMember.upsert({
                where: {
                    projectId_userId: {
                        projectId: projectId.toString(),
                        userId: userId
                    }
                },
                update: { role: 'member' },
                create: {
                    projectId: projectId.toString(),
                    userId: userId,
                    role: 'member'
                }
            });
            
            // Update member count in analytics
            await this.updateProjectAnalytics(projectId);
            
            return project;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to add member to project', error);
        }
    }

    async removeMemberFromProject(projectId, userId) {
        try {
            // Parallel execution for better performance
            const [project] = await Promise.all([
                Project.findByIdAndUpdate(
                    projectId,
                    { $pull: { members: userId } },
                    { new: true }
                ),
                prisma.projectMember.deleteMany({
                    where: {
                        projectId: projectId.toString(),
                        userId: userId
                    }
                })
            ]);
            
            if (!project) {
                throw new NotFoundError('Project', projectId);
            }
            
            // Update member count in analytics
            await this.updateProjectAnalytics(projectId);
            
            return project;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to remove member from project', error);
        }
    }

    // Prisma operations for analytics with optimization
    async getProjectAnalytics(projectId, useCache = true) {
        try {
            // Use findUniqueOrThrow for cleaner error handling
            const analytics = await prisma.projectAnalytics.findUnique({
                where: { projectId: projectId.toString() },
                select: PROJECT_ANALYTICS_SELECT
            });
            
            return analytics;
        } catch (error) {
            // Return default analytics if not found instead of throwing
            if (error.code === 'P2025') {
                return null;
            }
            throw new DatabaseError('Failed to retrieve project analytics', error);
        }
    }

    async getProjectTaskMetrics(projectId, options = {}) {
        try {
            const { limit = 50, status, userId } = options;
            
            const where = {
                projectId: projectId.toString(),
                ...(status && { status }),
                ...(userId && { userId })
            };
            
            // Optimized query with strategic field selection
            const metrics = await prisma.taskMetrics.findMany({
                where,
                select: {
                    taskId: true,
                    projectId: true,
                    userId: true,
                    status: true,
                    timeSpent: true,
                    completedAt: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            });
            
            // Batch fetch user data if needed
            if (options.includeUsers && metrics.length > 0) {
                const userIds = [...new Set(metrics.map(m => m.userId).filter(Boolean))];
                
                if (userIds.length > 0) {
                    const users = await prisma.user.findMany({
                        where: { id: { in: userIds } },
                        select: USER_SELECT
                    });
                    
                    const userMap = new Map(users.map(u => [u.id, u]));
                    metrics.forEach(m => {
                        if (m.userId) {
                            m.user = userMap.get(m.userId);
                        }
                    });
                }
            }
            
            return metrics;
        } catch (error) {
            throw new DatabaseError('Failed to retrieve project task metrics', error);
        }
    }

    async getProjectDashboardData(projectId) {
        try {
            // Optimize: Parallel execution of all queries
            const [analytics, taskMetrics, recentActivity, teamMembers] = await Promise.all([
                this.getProjectAnalytics(projectId),
                this.getProjectTaskMetrics(projectId, { limit: 20 }),
                // Get recent task status changes
                prisma.taskMetrics.findMany({
                    where: { projectId: projectId.toString() },
                    orderBy: { updatedAt: 'desc' },
                    take: 10,
                    select: {
                        taskId: true,
                        status: true,
                        userId: true,
                        updatedAt: true
                    }
                }),
                // Get team member stats
                prisma.projectMember.findMany({
                    where: { projectId: projectId.toString() },
                    select: {
                        userId: true,
                        role: true
                    }
                })
            ]);

            // Calculate additional metrics
            const summary = {
                totalTasks: analytics?.totalTasks || 0,
                completedTasks: analytics?.completedTasks || 0,
                inProgressTasks: analytics?.inProgressTasks || 0,
                pendingTasks: analytics?.pendingTasks || 0,
                overdueTasks: analytics?.overdueTasks || 0,
                totalMembers: teamMembers.length,
                completionRate: analytics?.totalTasks > 0 
                    ? parseFloat(((analytics.completedTasks / analytics.totalTasks) * 100).toFixed(2))
                    : 0,
                productivity: analytics?.productivityScore || 0,
                avgCompletionTime: analytics?.avgTaskCompletionTime || 0
            };

            // Aggregate task metrics by status for chart data
            const tasksByStatus = taskMetrics.reduce((acc, task) => {
                acc[task.status] = (acc[task.status] || 0) + 1;
                return acc;
            }, {});

            return {
                analytics,
                summary,
                tasksByStatus,
                recentActivity,
                taskMetrics: taskMetrics.slice(0, 10), // Return only top 10 for dashboard
                teamSize: teamMembers.length
            };
        } catch (error) {
            throw new DatabaseError('Failed to retrieve project dashboard data', error);
        }
    }

    // Helper methods with optimization
    async initializeProjectAnalytics(projectId, ownerId) {
        try {
            const projectIdStr = projectId.toString();
            
            // Use transaction to ensure atomicity
            await prisma.$transaction(async (tx) => {
                // Create analytics and project member in single transaction
                await Promise.all([
                    tx.projectAnalytics.create({
                        data: {
                            projectId: projectIdStr,
                            totalTasks: 0,
                            completedTasks: 0,
                            inProgressTasks: 0,
                            pendingTasks: 0,
                            overdueTasks: 0,
                            totalMembers: 1,
                            totalComments: 0,
                            totalTimeSpent: 0,
                            completionRate: 0,
                            lastUpdated: new Date(),
                            createdAt: new Date()
                        }
                    }),
                    tx.projectMember.create({
                        data: {
                            projectId: projectIdStr,
                            userId: ownerId,
                            role: 'owner'
                        }
                    })
                ]);
            });
        } catch (error) {
            console.error('Failed to initialize project analytics:', error);
            // Don't throw to avoid breaking project creation
        }
    }

    async updateProjectAnalytics(projectId) {
        try {
            // Optimize: Use aggregation pipelines for better performance
            const projectIdStr = projectId.toString();
            
            // Parallel execution of MongoDB queries
            const [tasks, comments, project] = await Promise.all([
                Task.find({ projectId }).lean().select('status dueDate'),
                Comment.countDocuments({ projectId }),
                Project.findById(projectId).lean().select('members')
            ]);

            if (!project) return;

            // Calculate metrics
            const now = new Date();
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
            const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'todo').length;
            const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length;
            const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            // Use upsert with computed values
            await prisma.projectAnalytics.upsert({
                where: { projectId: projectIdStr },
                update: {
                    totalTasks,
                    completedTasks,
                    inProgressTasks,
                    pendingTasks,
                    overdueTasks,
                    totalMembers: project.members.length + 1, // +1 for owner
                    totalComments: comments,
                    completionRate,
                    lastUpdated: now
                },
                create: {
                    projectId: projectIdStr,
                    totalTasks,
                    completedTasks,
                    inProgressTasks,
                    pendingTasks,
                    overdueTasks,
                    totalMembers: project.members.length + 1,
                    totalComments: comments,
                    totalTimeSpent: 0,
                    completionRate,
                    lastUpdated: now,
                    createdAt: now
                }
            });
        } catch (error) {
            console.error('Failed to update project analytics:', error);
            // Don't throw to avoid breaking main operation
        }
    }
    
    // Batch operations for better performance
    async batchUpdateProjects(updates) {
        try {
            const operations = updates.map(({ projectId, data }) => 
                Project.findByIdAndUpdate(projectId, data, { new: true })
            );
            
            return await Promise.all(operations);
        } catch (error) {
            throw new DatabaseError('Failed to batch update projects', error);
        }
    }
    
    // Get projects with analytics in batch
    async getProjectsWithAnalytics(projectIds) {
        try {
            const projectIdStrs = projectIds.map(id => id.toString());
            
            // Parallel batch queries
            const [projects, analytics] = await Promise.all([
                Project.find({ _id: { $in: projectIds } }).lean(),
                prisma.projectAnalytics.findMany({
                    where: { projectId: { in: projectIdStrs } },
                    select: PROJECT_ANALYTICS_SELECT
                })
            ]);
            
            // Map analytics to projects
            const analyticsMap = new Map(analytics.map(a => [a.projectId, a]));
            
            return projects.map(project => ({
                ...project,
                analytics: analyticsMap.get(project._id.toString())
            }));
        } catch (error) {
            throw new DatabaseError('Failed to get projects with analytics', error);
        }
    }
}

export default new ProjectService();
