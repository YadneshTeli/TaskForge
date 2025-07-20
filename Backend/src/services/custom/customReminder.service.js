// src/services/custom/customReminder.service.js
const CustomReminder = require('../../models/custom/customReminder.model');

module.exports = {
    createCustomReminder: async (time) => {
        const reminder = new CustomReminder({ time });
        return await reminder.save();
    },
    getCustomReminders: async () => {
        return await CustomReminder.find();
    },
    updateCustomReminder: async (id, updates) => {
        return await CustomReminder.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteCustomReminder: async (id) => {
        const result = await CustomReminder.findByIdAndDelete(id);
        return !!result;
    }
};
