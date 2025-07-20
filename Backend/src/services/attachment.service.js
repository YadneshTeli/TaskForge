// src/services/attachment.service.js
// Service for handling task attachment logic

const Task = require('../models/task.model');

module.exports = {
    addTaskAttachment: async (taskId, url) => {
        return await Task.findByIdAndUpdate(taskId, { $push: { attachments: url } }, { new: true });
    },
    removeTaskAttachment: async (taskId, attachmentUrl) => {
        return await Task.findByIdAndUpdate(taskId, { $pull: { attachments: attachmentUrl } }, { new: true });
    }
};
