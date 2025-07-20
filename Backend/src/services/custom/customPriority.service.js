// src/services/custom/customPriority.service.js
const CustomPriority = require('../../models/custom/customPriority.model');

module.exports = {
    createCustomPriority: async (level) => {
        const priority = new CustomPriority({ level });
        return await priority.save();
    },
    getCustomPriorities: async () => {
        return await CustomPriority.find();
    },
    updateCustomPriority: async (id, updates) => {
        return await CustomPriority.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteCustomPriority: async (id) => {
        const result = await CustomPriority.findByIdAndDelete(id);
        return !!result;
    }
};
