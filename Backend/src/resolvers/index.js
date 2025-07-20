const { PrismaClient } = require('@prisma/client');
const { GraphQLUpload } = require('graphql-upload');
const prisma = new PrismaClient();
const Task = require("../models/task.model");
const CommentService = require('../services/comment.service');
const TaskService = require('../services/task.service');
const NotificationService = require('../services/notification.service');

module.exports = {
    Upload: GraphQLUpload,
    Query: {
        me: async (_, __, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return prisma.user.findUnique({ where: { id: user.id } });
        },
        getProjects: async (_, __, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return prisma.project.findMany({ where: { ownerId: user.id } });
        },
        getTasks: async (_, { projectId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return Task.find({ projectId });
        },
        getNotifications: async (_, __, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await NotificationService.getUserNotifications(user.id);
        },
        getTaskComments: async (_, { taskId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await CommentService.getTaskComments(taskId);
        },
    },
    Mutation: {
        createProject: async (_, { name }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return prisma.project.create({ data: { name, ownerId: user.id } });
        },
        createTask: async (_, { projectId, title, description, dueDate }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            // Use TaskService for consistency and support description/dueDate
            return await TaskService.createTask(projectId, title, description, dueDate);
        },
        uploadAttachment: async (_, { taskId, file }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            const { createReadStream, filename } = await file;
            // TODO: Implement uploadToCloudinary or import it
            // const url = await uploadToCloudinary(createReadStream(), filename);
            // return Task.findByIdAndUpdate(taskId, { $push: { attachments: url } }, { new: true });
            throw new Error('uploadToCloudinary not implemented');
        },
        markNotificationAsSeen: async (_, { id }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await NotificationService.markNotificationAsSeen(id);
        },
        addComment: async (_, { taskId, content }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await CommentService.addComment(taskId, content, user.id);
        },
        deleteComment: async (_, { id }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await CommentService.deleteComment(id);
        },
        updateProject: async (_, { id, name }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await require('../services/project.service').updateProject(id, { name });
        },
        deleteProject: async (_, { id }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await require('../services/project.service').deleteProject(id);
        },
        createTask: async (_, { projectId, title, description, dueDate }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await TaskService.createTask(projectId, title, description, dueDate);
        },
        updateTask: async (_, { id, title, description, dueDate, status }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            const updates = {};
            if (title !== undefined) updates.title = title;
            if (description !== undefined) updates.description = description;
            if (dueDate !== undefined) updates.dueDate = dueDate;
            if (status !== undefined) updates.status = status;
            return await TaskService.updateTask(id, updates);
        },
        deleteTask: async (_, { id }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await TaskService.deleteTask(id);
        },
        assignTaskToUser: async (_, { taskId, userId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await TaskService.assignTaskToUser(taskId, userId);
        },
        unassignTaskFromUser: async (_, { taskId }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await TaskService.unassignTaskFromUser(taskId);
        },
        updateTaskStatus: async (_, { taskId, status }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await TaskService.updateTaskStatus(taskId, status);
        },
        updateTaskDueDate: async (_, { taskId, dueDate }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await TaskService.updateTaskDueDate(taskId, dueDate);
        },
        updateTaskTitle: async (_, { taskId, title }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await TaskService.updateTaskTitle(taskId, title);
        },
        updateTaskDescription: async (_, { taskId, description }, { user }) => {
            if (!user) throw new Error('Unauthorized');
            return await TaskService.updateTaskDescription(taskId, description);
        },
        assignTaskToProject: async () => { throw new Error('Not implemented'); },
        unassignTaskFromProject: async () => { throw new Error('Not implemented'); },
        addTaskAttachment: async (_, { taskId, file }) => {
            // TODO: Implement file upload and get URL
            // const url = await uploadToCloudinary(...)
            // return await require('../services/attachment.service').addTaskAttachment(taskId, url);
            throw new Error('File upload not implemented');
        },
        removeTaskAttachment: async (_, { taskId, attachmentUrl }) => {
            return await require('../services/attachment.service').removeTaskAttachment(taskId, attachmentUrl);
        },
        createNotification: async (_, { content }, { user }) => {
            return await NotificationService.createNotification(content, user.id);
        },
        markNotificationAsSeen: async (_, { id }) => {
            return await NotificationService.markNotificationAsSeen(id);
        },
    }
};