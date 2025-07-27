const { PrismaClient } = require('@prisma/client');
const { GraphQLUpload } = require('graphql-upload');
const prisma = new PrismaClient();

// Import services for hybrid architecture
const taskService = require('../services/task.service');
const projectService = require('../services/project.service');
const commentService = require('../services/comment.service');
const notificationService = require('../services/notification.service');

// Import models for direct MongoDB operations where needed
const User = require('../models/user.model');
const Task = require('../models/task.model');
const Project = require('../models/project.model');
const Comment = require('../models/comment.model');

module.exports = {
    Upload: GraphQLUpload,
    
    Query: {
        // User queries
        me: async (_, __, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await User.findById(user.id).lean();
        },
        
        getUserStats: async (_, { userId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await taskService.getUserTaskStats(userId || user.id);
        },

        // Project queries - MongoDB for core data
        getProjects: async (_, __, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await projectService.getUserProjects(user.id);
        },
        
        getProject: async (_, { projectId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await projectService.getProjectById(projectId);
        },
        
        // Project analytics - Prisma for analytics
        getProjectAnalytics: async (_, { projectId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await projectService.getProjectDashboardData(projectId);
        },

        // Task queries - MongoDB for core data
        getTasks: async (_, { projectId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await taskService.getTasksByProject(projectId);
        },
        
        // Task analytics - Prisma for analytics
        getTaskAnalytics: async (_, { projectId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await taskService.getTaskAnalytics(projectId);
        },

        // Comment queries - MongoDB
        getTaskComments: async (_, { taskId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await Comment.find({ task: taskId })
                .populate('author', 'username email')
                .lean();
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
            return await Comment.create(commentData);
        },
        
        deleteComment: async (_, { commentId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            const comment = await Comment.findByIdAndDelete(commentId);
            return { success: !!comment, message: comment ? 'Comment deleted' : 'Comment not found' };
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
            return await User.findById(task.assignedTo).lean();
        },
        comments: async (task) => {
            return await Comment.find({ task: task._id })
                .populate('author', 'username email')
                .lean();
        },
    },

    UserStats: {
        user: async (stats) => {
            return await User.findById(stats.userId).lean();
        },
    },
};