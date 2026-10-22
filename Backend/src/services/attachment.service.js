// src/services/attachment.service.js
// Service for handling task attachment logic

import Task from '../models/task.model.js';

export default {
    addTaskAttachment: async (taskId, attachment, uploadedBy = null) => {
        const attachmentObj = typeof attachment === 'string'
            ? { url: attachment, filename: attachment.split('/').pop(), uploadedBy, uploadedAt: new Date() }
            : { ...attachment, uploadedAt: new Date() };
        return await Task.findByIdAndUpdate(
            taskId,
            { $push: { attachments: attachmentObj } },
            { new: true }
        );
    },
    removeTaskAttachment: async (taskId, attachmentUrl) => {
        return await Task.findByIdAndUpdate(
            taskId,
            { $pull: { attachments: { url: attachmentUrl } } },
            { new: true }
        );
    }
};
