const prisma = require("../../prisma/client");
const Task = require("../models/task.model");

module.exports = {
    Query: {
        me: async (_, __, { user }) => prisma.user.findUnique({ where: { id: user.id } }),
        getProjects: async (_, __, { user }) => prisma.project.findMany({ where: { ownerId: user.id } }),
        getTasks: async (_, { projectId }) => Task.find({ projectId }),
        getNotifications: async (_, __, { user }) => prisma.notification.findMany({ where: { userId: user.id } })
    },
    Mutation: {
        createProject: async (_, { name }, { user }) => prisma.project.create({ data: { name, ownerId: user.id } }),
        addTask: async (_, { projectId, title }) => Task.create({ title, projectId }),
        uploadAttachment: async (_, { taskId, file }) => {
            const { createReadStream, filename } = await file;
            const url = await uploadToCloudinary(createReadStream(), filename);
            return Task.findByIdAndUpdate(taskId, { $push: { attachments: url } }, { new: true });
        },
        markNotificationSeen: async (_, { id }) => prisma.notification.update({ where: { id }, data: { seen: true } })
    }
};