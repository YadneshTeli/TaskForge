import { PrismaClient } from '@prisma/client';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { 
    AuthenticationError, 
    NotFoundError
} from '../utils/errors.js';

const prisma = new PrismaClient();

// Import services for hybrid architecture
import taskService from '../services/task.service.js';
import projectService from '../services/project.service.js';
import commentService from '../services/comment.service.js';
import notificationService from '../services/notification.service.js';

// Import MongoDB models for direct operations where needed
import Task from '../models/task.model.js';
import Project from '../models/project.model.js';

function normalizeTaskStatusForGql(status) {
    if (!status) return 'todo';
    const s = String(status).toLowerCase().trim();
    if (s === 'in-progress' || s === 'in progress' || s === 'in_progress') return 'in_progress';
    if (s === 'done' || s === 'completed') return 'done';
    return 'todo';
}

function normalizeTaskStatusForDb(status) {
    if (!status) return undefined;
    const s = String(status).toLowerCase().trim();
    if (s === 'in_progress' || s === 'in progress') return 'in-progress';
    if (s === 'completed') return 'done';
    return s;
}

// Export async function that returns resolvers
async function getResolvers() {
    const resolveUserProjects = async (userId) => {
        const result = await projectService.getUserProjects(userId);
        return Array.isArray(result) ? result : (result?.projects || []);
    };

    const resolveProjectTasks = async (projectId, userId) => {
        if (projectId) {
            const result = await taskService.getTasksByProject(projectId);
            return Array.isArray(result) ? result : (result?.tasks || []);
        }
        const userProjects = await resolveUserProjects(userId);
        const projectIds = userProjects.map(p => p._id);
        return await Task.find({
            $or: [
                { projectId: { $in: projectIds } },
                { assignedTo: userId },
                { createdBy: userId }
            ]
        }).sort({ createdAt: -1 }).lean();
    };

    return {
        Upload: GraphQLUpload,
    
        Query: {
            // User queries
            me: async (_, __, { user }) => {
                if (!user) throw new AuthenticationError();
                const foundUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: {
                        projectMembers: true,
                        userStats: true
                    }
                });
                if (!foundUser) throw new NotFoundError('User', user.id);
                return foundUser;
            },
            
            getUserStats: async (_, { userId }, { user }) => {
                if (!user) throw new AuthenticationError();
                const targetId = userId ? parseInt(userId, 10) : user.id;
                return await taskService.getUserTaskStats(targetId);
            },

            userStats: async (_, { userId }, { user }) => {
                if (!user) throw new AuthenticationError();
                const targetId = userId ? parseInt(userId, 10) : user.id;
                return await taskService.getUserTaskStats(targetId);
            },

            // Project queries - MongoDB for core data
            getProjects: async (_, __, { user }) => {
                if (!user) throw new AuthenticationError();
                return await resolveUserProjects(user.id);
            },

            projects: async (_, __, { user }) => {
                if (!user) throw new AuthenticationError();
                return await resolveUserProjects(user.id);
            },
            
            getProject: async (_, { projectId }, { user }) => {
                if (!user) throw new AuthenticationError();
                const project = await projectService.getProjectById(projectId);
                if (!project) throw new NotFoundError('Project', projectId);
                return project;
            },
            
            // Project analytics - Prisma for analytics
            getProjectAnalytics: async (_, { projectId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await projectService.getProjectAnalytics(projectId);
            },

            projectAnalytics: async (_, { projectId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await projectService.getProjectAnalytics(projectId);
            },

            // Task queries - MongoDB for core data
            getTasks: async (_, { projectId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await resolveProjectTasks(projectId, user.id);
            },

            tasks: async (_, { projectId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await resolveProjectTasks(projectId, user.id);
            },
            
            // Task analytics - Prisma for analytics
            getTaskAnalytics: async (_, { projectId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await taskService.getTaskAnalytics(projectId);
            },

            taskMetrics: async (_, { taskId }, { user }) => {
                if (!user) throw new AuthenticationError();
                const metric = await prisma.taskMetrics.findUnique({
                    where: { taskId: String(taskId) }
                });
                const task = await Task.findById(taskId).lean().catch(() => null);
                if (!metric && !task) return null;
                return {
                    taskId: String(taskId),
                    title: task?.title || 'Task',
                    status: metric?.status || task?.status || 'todo',
                    timeSpent: metric?.timeSpent || 0,
                    priority: task?.priority || 'medium',
                    createdAt: (metric?.createdAt || task?.createdAt || new Date()).toISOString(),
                    updatedAt: (metric?.updatedAt || task?.updatedAt || new Date()).toISOString(),
                    completedAt: metric?.completedAt ? metric.completedAt.toISOString() : null,
                    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString() : null,
                    userId: metric?.userId || task?.assignedTo || null
                };
            },

            // Comment queries - MongoDB
            getTaskComments: async (_, { taskId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await commentService.getTaskComments(taskId);
            },

            // Notification queries - Prisma
            getNotifications: async (_, __, { user }) => {
                if (!user) throw new AuthenticationError();
                return await notificationService.getUserNotifications(user.id);
            },

            notifications: async (_, __, { user }) => {
                if (!user) throw new AuthenticationError();
                return await notificationService.getUserNotifications(user.id);
            },
        },
        
        Mutation: {
            // Project mutations - MongoDB with Prisma analytics sync
            createProject: async (_, { input }, { user }) => {
                if (!user) throw new AuthenticationError();
                const projectData = {
                    ...input,
                    owner: user.id
                };
                return await projectService.createProject(projectData);
            },
            
            updateProject: async (_, { projectId, id, input }, { user }) => {
                if (!user) throw new AuthenticationError();
                const targetProjectId = projectId || id;
                const { addMemberIds, removeMemberIds, ...restInput } = input;
                if (addMemberIds?.length) {
                    for (const memberId of addMemberIds) {
                        await projectService.addMemberToProject(targetProjectId, parseInt(memberId, 10));
                    }
                }
                if (removeMemberIds?.length) {
                    for (const memberId of removeMemberIds) {
                        await projectService.removeMemberFromProject(targetProjectId, parseInt(memberId, 10));
                    }
                }
                return await projectService.updateProject(targetProjectId, restInput);
            },
            
            deleteProject: async (_, { projectId, id }, { user }) => {
                if (!user) throw new AuthenticationError();
                const targetProjectId = projectId || id;
                const success = await projectService.deleteProject(targetProjectId);
                return { success, message: success ? 'Project deleted' : 'Project not found' };
            },
            
            addProjectMember: async (_, { projectId, userId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await projectService.addMemberToProject(projectId, parseInt(userId, 10));
            },

            // Task mutations - MongoDB with Prisma analytics sync
            createTask: async (_, { input }, { user }) => {
                if (!user) throw new AuthenticationError();
                const taskData = {
                    ...input,
                    status: normalizeTaskStatusForDb(input.status) || 'todo',
                    assignedTo: input.assignedTo ? parseInt(input.assignedTo, 10) : undefined,
                    createdBy: user.id
                };
                return await taskService.createTask(taskData);
            },
            
            updateTask: async (_, { taskId, id, input }, { user }) => {
                if (!user) throw new AuthenticationError();
                const targetTaskId = taskId || id;
                const updateData = {
                    ...input,
                    ...(input.status && { status: normalizeTaskStatusForDb(input.status) }),
                    ...(input.assignedTo !== undefined && {
                        assignedTo: input.assignedTo ? parseInt(input.assignedTo, 10) : null
                    })
                };
                return await taskService.updateTask(targetTaskId, updateData);
            },
            
            deleteTask: async (_, { taskId, id }, { user }) => {
                if (!user) throw new AuthenticationError();
                const targetTaskId = taskId || id;
                const success = await taskService.deleteTask(targetTaskId);
                return { success, message: success ? 'Task deleted' : 'Task not found' };
            },
            
            assignTask: async (_, { taskId, userId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await taskService.assignTaskToUser(taskId, parseInt(userId, 10));
            },

            // Comment mutations - MongoDB
            createComment: async (_, { input }, { user }) => {
                if (!user) throw new AuthenticationError();
                const commentData = {
                    ...input,
                    content: input.text,
                    author: user.id
                };
                return await commentService.createComment(commentData);
            },

            addComment: async (_, { taskId, text }, { user }) => {
                if (!user) throw new AuthenticationError();
                await commentService.createComment({
                    taskId,
                    content: text,
                    author: user.id
                });
                return await Task.findById(taskId).lean();
            },
            
            deleteComment: async (_, { commentId }, { user }) => {
                if (!user) throw new AuthenticationError();
                const deleted = await commentService.deleteComment(commentId);
                return { success: deleted, message: deleted ? 'Comment deleted' : 'Comment not found' };
            },

            // Notification mutations
            markNotificationAsSeen: async (_, { notificationId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await notificationService.markNotificationAsSeen(notificationId);
            },

            markNotificationAsRead: async (_, { id }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await notificationService.markNotificationAsSeen(id);
            },

            markAllNotificationsAsRead: async (_, __, { user }) => {
                if (!user) throw new AuthenticationError();
                const res = await prisma.notification.updateMany({
                    where: { userId: user.id, seen: false },
                    data: { seen: true }
                });
                return { success: true, message: 'All notifications marked as read', count: res.count };
            },

            deleteNotification: async (_, { id }, { user }) => {
                if (!user) throw new AuthenticationError();
                await prisma.notification.deleteMany({
                    where: { id: parseInt(id, 10), userId: user.id }
                });
                return { success: true, message: 'Notification deleted' };
            },
            
            createNotification: async (_, { input }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await notificationService.createNotification(input.content, input.userId || user.id);
            },

            // File upload
            uploadAttachment: async (_, { taskId }, { user }) => {
                if (!user) throw new AuthenticationError();
                return await Task.findById(taskId).lean();
            },
        },

        // Type resolvers for complex fields
        User: {
            id: (user) => String(user.id || user._id),
            firstName: (user) => user.fullName ? user.fullName.split(' ')[0] : user.username,
            lastName: (user) => {
                if (!user.fullName) return '';
                const parts = user.fullName.split(' ');
                return parts.length > 1 ? parts.slice(1).join(' ') : '';
            },
            createdAt: (user) => user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt || new Date().toISOString()),
            updatedAt: (user) => user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt || new Date().toISOString()),
            stats: async (user) => {
                return await taskService.getUserTaskStats(user.id);
            },
            projects: async (user) => {
                return await resolveUserProjects(user.id);
            },
            tasks: async (user) => {
                return await Task.find({ assignedTo: user.id }).lean();
            },
        },

        Project: {
            id: (project) => String(project.id || project._id),
            status: (project) => project.status || 'active',
            createdAt: (project) => project.createdAt instanceof Date ? project.createdAt.toISOString() : String(project.createdAt || new Date().toISOString()),
            updatedAt: (project) => project.updatedAt instanceof Date ? project.updatedAt.toISOString() : String(project.updatedAt || new Date().toISOString()),
            dueDate: (project) => project.dueDate ? (project.dueDate instanceof Date ? project.dueDate.toISOString() : String(project.dueDate)) : null,
            attachments: (project) => (project.attachments || []).map(a => typeof a === 'string' ? a : a.url).filter(Boolean),
            owner: async (project) => {
                const owner = await prisma.user.findUnique({ where: { id: project.owner } });
                return owner || {
                    id: String(project.owner || 0),
                    email: 'owner@taskforge.com',
                    username: 'owner',
                    role: 'USER',
                    isActive: true,
                    isOnline: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            },
            members: async (project) => {
                if (!project.members || project.members.length === 0) return [];
                return await prisma.user.findMany({ where: { id: { in: project.members } } });
            },
            tasks: async (project) => {
                return await Task.find({ projectId: project._id }).lean();
            },
            comments: async (project) => {
                return await commentService.getProjectComments(project._id.toString());
            },
            analytics: async (project) => {
                return await projectService.getProjectAnalytics(project._id);
            },
        },

        Task: {
            id: (task) => String(task.id || task._id),
            projectId: (task) => String(task.projectId),
            status: (task) => normalizeTaskStatusForGql(task.status),
            priority: (task) => task.priority || 'medium',
            createdAt: (task) => task.createdAt instanceof Date ? task.createdAt.toISOString() : String(task.createdAt || new Date().toISOString()),
            updatedAt: (task) => task.updatedAt instanceof Date ? task.updatedAt.toISOString() : String(task.updatedAt || new Date().toISOString()),
            dueDate: (task) => task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : String(task.dueDate)) : null,
            attachments: (task) => (task.attachments || []).map(a => typeof a === 'string' ? a : a.url).filter(Boolean),
            assignedTo: async (task) => {
                if (!task.assignedTo) return null;
                return await prisma.user.findUnique({ where: { id: Number(task.assignedTo) } });
            },
            comments: async (task) => {
                return await commentService.getTaskComments((task._id || task.id).toString());
            },
        },

        TaskComment: {
            id: (comment) => String(comment.id || comment._id),
            text: (comment) => comment.content || comment.text || '',
            createdAt: (comment) => comment.createdAt instanceof Date ? comment.createdAt.toISOString() : String(comment.createdAt || new Date().toISOString()),
            user: async (comment) => {
                const authorId = comment.author || comment.userId;
                if (!authorId) return null;
                return await prisma.user.findUnique({ where: { id: Number(authorId) } });
            },
            userId: async (comment) => {
                const authorId = comment.author || comment.userId;
                if (!authorId) return null;
                return await prisma.user.findUnique({ where: { id: Number(authorId) } });
            },
        },

        Comment: {
            id: (comment) => String(comment.id || comment._id),
            text: (comment) => comment.content || comment.text || '',
            content: (comment) => comment.content || comment.text || '',
            createdAt: (comment) => comment.createdAt instanceof Date ? comment.createdAt.toISOString() : String(comment.createdAt || new Date().toISOString()),
            author: async (comment) => {
                return await prisma.user.findUnique({ where: { id: Number(comment.author) } });
            },
        },

        Notification: {
            id: (notif) => String(notif.id || notif._id),
            title: (notif) => notif.type ? notif.type.replace(/_/g, ' ').toUpperCase() : 'Notification',
            message: (notif) => notif.content,
            content: (notif) => notif.content,
            type: (notif) => notif.type || 'system_update',
            seen: (notif) => Boolean(notif.seen),
            isRead: (notif) => Boolean(notif.seen),
            userId: (notif) => String(notif.userId || notif.user),
            createdAt: (notif) => notif.createdAt instanceof Date ? notif.createdAt.toISOString() : String(notif.createdAt || new Date().toISOString()),
            updatedAt: (notif) => notif.createdAt instanceof Date ? notif.createdAt.toISOString() : String(notif.createdAt || new Date().toISOString()),
            user: async (notif) => {
                const uid = notif.userId || notif.user;
                if (!uid) return null;
                return await prisma.user.findUnique({ where: { id: Number(uid) } });
            },
        },

        UserStats: {
            totalTasks: (stats) => stats.totalTasksCreated || 0,
            completedTasks: (stats) => stats.totalTasksCompleted || 0,
            pendingTasks: (stats) => stats.totalTasksPending || 0,
            overdueTasks: (stats) => stats.totalTasksOverdue || 0,
            averageCompletionTime: (stats) => stats.avgCompletionTime || 0,
            lastActiveAt: (stats) => stats.lastActivityAt instanceof Date ? stats.lastActivityAt.toISOString() : String(stats.lastActivityAt || new Date().toISOString()),
            user: async (stats) => {
                return await prisma.user.findUnique({ where: { id: stats.userId } });
            },
        },

        ProjectAnalytics: {
            averageCompletionTime: (analytics) => analytics.avgTaskCompletionTime || 0,
            teamProductivity: (analytics) => analytics.productivityScore || 0,
            lastUpdated: (analytics) => analytics.lastUpdated instanceof Date ? analytics.lastUpdated.toISOString() : String(analytics.lastUpdated || new Date().toISOString()),
        },
    };
}

export default getResolvers;
