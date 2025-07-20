// src/services/log.service.js
const Log = require('../models/log.model');

module.exports = {
    logAction: async (action, projectId = null) => {
        const log = new Log({ action, project: projectId });
        return await log.save();
    },
    getLogs: async (projectId) => {
        return await Log.find({ project: projectId });
    }
};
