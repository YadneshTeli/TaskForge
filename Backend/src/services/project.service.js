// src/services/project.service.js
// Project service for handling project-related logic with hybrid MongoDB + Prisma approach

import { PrismaClient } from '@prisma/client';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Comment from '../models/comment.model.js';
const prisma = new PrismaClient();

class ProjectService {
    // MongoDB operations for core project functionality
    async createProject(projectData) {
        const project = await Project.create(projectData);
        
        // Initialize analytics in Prisma
        await this.initializeProjectAnalytics(project._id, project.owner);
        
        return project;
    }

    async getProjectById(projectId) {
        return await Project.findById(projectId)
            .populate('owner', 'username email')
            .populate('members', 'username email')
            .populate('tasks')
            .populate('comments')
            .lean();
    }

    async getUserProjects(userId) {
        return await Project.find({
            $or: [
                { owner: userId },
                { members: userId }
            ]
        })
        .populate('owner', 'username email')
        .populate('members', 'username email')
        .lean();
    }

    async updateProject(projectId, updateData) {
        const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true })
            .populate('owner', 'username email')
            .populate('members', 'username email');
        
        if (project) {
            await this.updateProjectAnalytics(projectId);
        }
        
        return project;
    }

    async deleteProject(projectId) {
        const project = await Project.findById(projectId);
        if (project) {
            // Delete related tasks and comments
            await Task.deleteMany({ projectId });
            await Comment.deleteMany({ projectId });
            await Project.findByIdAndDelete(projectId);
            
            // Remove analytics
            await prisma.projectAnalytics.deleteMany({
                where: { projectId: parseInt(projectId) }
            });
            
            await prisma.taskMetrics.deleteMany({
                where: { projectId: parseInt(projectId) }
            });
            
            return true;
        }
        return false;
    }

    async addMemberToProject(projectId, userId) {
        return await Project.findByIdAndUpdate(
            projectId,
            { $addToSet: { members: userId } },
            { new: true }
        ).populate('members', 'username email');
    }

    async removeMemberFromProject(projectId, userId) {
        return await Project.findByIdAndUpdate(
            projectId,
            { $pull: { members: userId } },
            { new: true }
        ).populate('members', 'username email');
    }

    // Prisma operations for analytics
    async getProjectAnalytics(projectId) {
        return await prisma.projectAnalytics.findUnique({
            where: { projectId: parseInt(projectId) },
            include: {
                project: {
                    select: { id: true, name: true, createdAt: true }
                }
            }
        });
    }

    async getProjectTaskMetrics(projectId) {
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

    async getProjectDashboardData(projectId) {
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
    }

    // Helper methods
    async initializeProjectAnalytics(projectId, ownerId) {
        const analyticsData = {
            projectId: parseInt(projectId) || 1,
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            overdueTasks: 0,
            totalMembers: 1, // Project owner
            totalComments: 0,
            totalTimeSpent: 0,
            lastUpdated: new Date(),
            createdAt: new Date()
        };

        await prisma.projectAnalytics.create({
            data: analyticsData
        });
    }

    async updateProjectAnalytics(projectId) {
        const [tasks, project] = await Promise.all([
            Task.find({ projectId }),
            Project.findById(projectId)
        ]);

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const pendingTasks = tasks.filter(t => t.status === 'todo').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
        const overdueTasks = tasks.filter(t => 
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
        ).length;

        const analyticsData = {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            overdueTasks,
            totalMembers: project ? project.members.length + 1 : 1, // +1 for owner
            totalComments: project ? project.comments.length : 0,
            lastUpdated: new Date()
        };

        await prisma.projectAnalytics.upsert({
            where: { projectId: parseInt(projectId) || 1 },
            update: analyticsData,
            create: {
                projectId: parseInt(projectId) || 1,
                ...analyticsData,
                createdAt: new Date()
            }
        });
    }
}

export default new ProjectService();
