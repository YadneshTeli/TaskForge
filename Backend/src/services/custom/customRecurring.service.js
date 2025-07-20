// src/services/custom/customRecurring.service.js
const CustomRecurring = require('../../models/custom/customRecurring.model');

module.exports = {
    createCustomRecurring: async (pattern) => {
        const recurring = new CustomRecurring({ pattern });
        return await recurring.save();
    },
    getCustomRecurrings: async () => {
        return await CustomRecurring.find();
    },
    updateCustomRecurring: async (id, updates) => {
        return await CustomRecurring.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteCustomRecurring: async (id) => {
        const result = await CustomRecurring.findByIdAndDelete(id);
        return !!result;
    }
};
