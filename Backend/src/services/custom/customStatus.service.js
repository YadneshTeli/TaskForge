// src/services/custom/customStatus.service.js
const CustomStatus = require('../../models/custom/customStatus.model');

module.exports = {
    createCustomStatus: async (name) => {
        const status = new CustomStatus({ name });
        return await status.save();
    },
    getCustomStatuses: async () => {
        return await CustomStatus.find();
    },
    updateCustomStatus: async (id, updates) => {
        return await CustomStatus.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteCustomStatus: async (id) => {
        const result = await CustomStatus.findByIdAndDelete(id);
        return !!result;
    }
};
