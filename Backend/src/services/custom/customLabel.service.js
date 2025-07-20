// src/services/custom/customLabel.service.js
const CustomLabel = require('../../models/custom/customLabel.model');

module.exports = {
    createCustomLabel: async (name) => {
        const label = new CustomLabel({ name });
        return await label.save();
    },
    getCustomLabels: async () => {
        return await CustomLabel.find();
    },
    updateCustomLabel: async (id, updates) => {
        return await CustomLabel.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteCustomLabel: async (id) => {
        const result = await CustomLabel.findByIdAndDelete(id);
        return !!result;
    }
};
