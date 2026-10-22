// src/services/log.service.js
import Log from '../models/log.model.js';

export default {
    logAction: async (action, projectId = null, userId = null, metadata = null) => {
        try {
            const log = new Log({
                action,
                projectId: projectId || undefined,
                userId: userId || undefined,
                metadata: metadata || undefined
            });
            return await log.save();
        } catch (error) {
            // Do not fail main request if audit log fails when MongoDB is disconnected
            console.warn('Warning: Failed to write audit log:', error.message);
            return null;
        }
    },
    getLogs: async (projectId) => {
        return await Log.find({ projectId }).sort({ createdAt: -1 }).lean();
    }
};
