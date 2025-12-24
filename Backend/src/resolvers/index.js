import { PrismaClient } from '@prisma/client';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { 
    AuthenticationError, 
    NotFoundError, 
    ValidationError,
    AuthorizationError 
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

// Export async function that returns resolvers
async function getResolvers() {
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
            return await taskService.getUserTaskStats(userId || user.id);
        },

        // Project queries - MongoDB for core data
        getProjects: async (_, __, { user }) => {
            if (!user) throw new AuthenticationError();
            return await projectService.getUserProjects(user.id);
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
            return await projectService.getProjectDashboardData(projectId);
        },

        // Task queries - MongoDB for core data
        getTasks: async (_, { projectId }, { user }) => {
            if (!user) throw new AuthenticationError();
            return await taskService.getTasksByProject(projectId);
        },
        
        // Task analytics - Prisma for analytics
        getTaskAnalytics: async (_, { projectId }, { user }) => {
            if (!user) throw new AuthenticationError();
            return await taskService.getTaskAnalytics(projectId);
        },

        // Comment queries - MongoDB
        getTaskComments: async (_, { taskId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await commentService.getTaskComments(taskId);
        },

        // Notification queries - MongoDB
        getNotifications: async (_, __, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await notificationService.getUserNotifications(user.id);
        },
    },
    
    Mutation: {
        // Project mutations - MongoDB with Prisma analytics sync
        createProject: async (_, { input }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            const projectData = {
                ...input,
                owner: user.id
            };
            return await projectService.createProject(projectData);
        },
        
        updateProject: async (_, { projectId, input }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await projectService.updateProject(projectId, input);
        },
        
        deleteProject: async (_, { projectId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            const success = await projectService.deleteProject(projectId);
            return { success, message: success ? 'Project deleted' : 'Project not found' };
        },
        
        addProjectMember: async (_, { projectId, userId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await projectService.addMemberToProject(projectId, userId);
        },

        // Task mutations - MongoDB with Prisma analytics sync
        createTask: async (_, { input }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await taskService.createTask(input);
        },
        
        updateTask: async (_, { taskId, input }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await taskService.updateTask(taskId, input);
        },
        
        deleteTask: async (_, { taskId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            const success = await taskService.deleteTask(taskId);
            return { success, message: success ? 'Task deleted' : 'Task not found' };
        },
        
        assignTask: async (_, { taskId, userId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await taskService.assignTaskToUser(taskId, userId);
        },

        // Comment mutations - MongoDB
        createComment: async (_, { input }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            const commentData = {
                ...input,
                author: user.id
            };
            return await commentService.createComment(commentData);
        },
        
        deleteComment: async (_, { commentId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            const deleted = await commentService.deleteComment(commentId);
            return { success: deleted, message: deleted ? 'Comment deleted' : 'Comment not found' };
        },

        // Notification mutations
        markNotificationAsSeen: async (_, { notificationId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await notificationService.markNotificationAsSeen(notificationId);
        },
        
        createNotification: async (_, { input }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await notificationService.createNotification(input.content, input.userId || user.id);
        },

        // File upload
        uploadAttachment: async (_, { taskId, file }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            // TODO: Implement file upload
            throw new Error('File upload not implemented yet');
        },
    },

    // Type resolvers for complex fields
    User: {
        stats: async (user) => {
            return await taskService.getUserTaskStats(user.id);
        },
        projects: async (user) => {
            return await projectService.getUserProjects(user.id);
        },
        tasks: async (user) => {
            return await Task.find({ assignedTo: user._id }).lean();
        },
    },

    Project: {
        owner: async (project) => {
            return await User.findById(project.owner).lean();
        },
        members: async (project) => {
            return await User.find({ _id: { $in: project.members } }).lean();
        },
        tasks: async (project) => {
            return await Task.find({ projectId: project._id }).lean();
        },
        analytics: async (project) => {
            return await projectService.getProjectAnalytics(project._id);
        },
    },

    Task: {
        assignedTo: async (task) => {
            if (!task.assignedTo) return null;
            return await prisma.user.findUnique({ where: { id: task.assignedTo } });
        },
        comments: async (task) => {
            return await commentService.getTaskComments(task._id.toString());
        },
    },

    UserStats: {
        user: async (stats) => {
            return await prisma.user.findUnique({ where: { id: stats.userId } });
        },
    },
    };
}

export default getResolvers;