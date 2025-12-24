// src/services/log.service.js
import Log from '../models/log.model.js';

export default {
    logAction: async (action, projectId = null) => {
        const log = new Log({ action, project: projectId });
        return await log.save();
    },
    getLogs: async (projectId) => {
        return await Log.find({ project: projectId });
    }
};
