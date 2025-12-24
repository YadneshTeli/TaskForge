// src/services/project.service.js
// Project service for handling project-related logic with hybrid MongoDB + Prisma approach

import { PrismaClient } from '@prisma/client';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Comment from '../models/comment.model.js';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

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

    async getProjectById(projectId) {
        try {
            const project = await Project.findById(projectId).lean();
            
            if (!project) {
                throw new NotFoundError('Project', projectId);
            }
            
            // Optionally populate user data from PostgreSQL
            const [owner, members] = await Promise.all([
                prisma.user.findUnique({ where: { id: project.owner }, select: { id: true, username: true, email: true, fullName: true } }),
                prisma.user.findMany({ where: { id: { in: project.members } }, select: { id: true, username: true, email: true, fullName: true } })
            ]);
            
            return {
                ...project,
                ownerData: owner,
                membersData: members
            };
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to retrieve project', error);
        }
    }

    async getUserProjects(userId) {
        try {
            return await Project.find({
                $or: [
                    { owner: userId },
                    { members: userId }
                ]
            }).lean();
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
            
            // Delete related tasks and comments
            await Task.deleteMany({ projectId });
            await Comment.deleteMany({ projectId });
            await Project.findByIdAndDelete(projectId);
            
            // Remove analytics
            await prisma.projectAnalytics.deleteMany({
                where: { projectId: projectId.toString() }
            });
            
            await prisma.taskMetrics.deleteMany({
                where: { projectId: projectId.toString() }
            });
            
            return true;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to delete project', error);
        }
    }

    async addMemberToProject(projectId, userId) {
        try {
            const project = await Project.findByIdAndUpdate(
                projectId,
                { $addToSet: { members: userId } },
                { new: true }
            );
            
            if (!project) {
                throw new NotFoundError('Project', projectId);
            }
            
            // Create ProjectMember record in PostgreSQL
            await prisma.projectMember.create({
                data: {
                    projectId: projectId.toString(),
                    userId: userId,
                    role: 'member'
                }
            }).catch(() => {}); // Ignore duplicate errors
            
            return project;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to add member to project', error);
        }
    }

    async removeMemberFromProject(projectId, userId) {
        try {
            const project = await Project.findByIdAndUpdate(
                projectId,
                { $pull: { members: userId } },
                { new: true }
            );
            
            if (!project) {
                throw new NotFoundError('Project', projectId);
            }
            
            // Remove ProjectMember record from PostgreSQL
            await prisma.projectMember.deleteMany({
                where: {
                    projectId: projectId.toString(),
                    userId: userId
                }
            });
            
            return project;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to remove member from project', error);
        }
    }

    // Prisma operations for analytics
    async getProjectAnalytics(projectId) {
        try {
            return await prisma.projectAnalytics.findUnique({
                where: { projectId: projectId.toString() }
            });
        } catch (error) {
            throw new DatabaseError('Failed to retrieve project analytics', error);
        }
    }

    async getProjectTaskMetrics(projectId) {
        try {
            return await prisma.taskMetrics.findMany({
                where: { projectId: projectId.toString() },
                include: {
                    // User relation not available directly, fetch separately if needed
                },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            throw new DatabaseError('Failed to retrieve project task metrics', error);
        }
    }

    async getProjectDashboardData(projectId) {
        try {
            const [analytics, taskMetrics] = await Promise.all([
                this.getProjectAnalytics(projectId),
                this.getProjectTaskMetrics(projectId)
            ]);

            return {
                analytics,
                taskMetrics,
                summary: {
                    totalTasks: analytics?.totalTasks || 0,
                    completedTasks: analytics?.completedTasks || 0,
                    pendingTasks: analytics?.pendingTasks || 0,
                    overdueTasks: analytics?.overdueTasks || 0,
                    completionRate: analytics?.totalTasks > 0 
                        ? ((analytics.completedTasks / analytics.totalTasks) * 100).toFixed(2)
                        : 0
                }
            };
        } catch (error) {
            throw new DatabaseError('Failed to retrieve project dashboard data', error);
        }
    }

    // Helper methods
    async initializeProjectAnalytics(projectId, ownerId) {
        try {
            const analyticsData = {
                projectId: projectId.toString(),
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                totalMembers: 1, // Project owner
                totalComments: 0,
                lastUpdated: new Date(),
                createdAt: new Date()
            };

            await prisma.projectAnalytics.create({
                data: analyticsData
            });
            
            // Create ProjectMember record for owner
            await prisma.projectMember.create({
                data: {
                    projectId: projectId.toString(),
                    userId: ownerId,
                    role: 'owner'
                }
            });
        } catch (error) {
            console.error('Failed to initialize project analytics:', error);
            // Don't throw here to avoid breaking project creation
        }
    }

    async updateProjectAnalytics(projectId) {
        try {
            const [tasks, comments] = await Promise.all([
                Task.find({ projectId }),
                Comment.find({ projectId })
            ]);

            const project = await Project.findById(projectId);
            if (!project) return;

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

            const analyticsData = {
                totalTasks,
                completedTasks,
                inProgressTasks,
                totalMembers: project.members.length + 1, // +1 for owner
                totalComments: comments.length,
                lastUpdated: new Date()
            };

            await prisma.projectAnalytics.upsert({
                where: { projectId: projectId.toString() },
                update: analyticsData,
                create: {
                    projectId: projectId.toString(),
                    ...analyticsData,
                    createdAt: new Date()
                }
            });
        } catch (error) {
            console.error('Failed to update project analytics:', error);
            // Don't throw here to avoid breaking the main operation
        }
    }
}

export default new ProjectService();
