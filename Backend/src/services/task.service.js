// src/services/task.service.js
// Service for handling task-related logic

const Task = require('../models/task.model');

module.exports = {
    createTask: async (projectId, title, description = '', dueDate = null) => {
        const task = new Task({
            title,
            description,
            dueDate,
            projectId
        });
        return await task.save();
    },
    updateTask: async (id, updates) => {
        return await Task.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteTask: async (id) => {
        const result = await Task.findByIdAndDelete(id);
        return !!result;
    },
    assignTaskToUser: async (taskId, userId) => {
        return await Task.findByIdAndUpdate(taskId, { assignedTo: userId }, { new: true });
    },
    unassignTaskFromUser: async (taskId) => {
        return await Task.findByIdAndUpdate(taskId, { assignedTo: null }, { new: true });
    },
    updateTaskStatus: async (taskId, status) => {
        return await Task.findByIdAndUpdate(taskId, { status }, { new: true });
    },
    updateTaskDueDate: async (taskId, dueDate) => {
        return await Task.findByIdAndUpdate(taskId, { dueDate }, { new: true });
    },
    updateTaskTitle: async (taskId, title) => {
        return await Task.findByIdAndUpdate(taskId, { title }, { new: true });
    },
    updateTaskDescription: async (taskId, description) => {
        return await Task.findByIdAndUpdate(taskId, { description }, { new: true });
    }
};
