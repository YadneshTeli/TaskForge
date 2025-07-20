// src/services/custom/customAssignee.service.js
const CustomAssignee = require('../../models/custom/customAssignee.model');

module.exports = {
    createCustomAssignee: async (userId) => {
        const assignee = new CustomAssignee({ user: userId });
        return await assignee.save();
    },
    getCustomAssignees: async () => {
        return await CustomAssignee.find().populate('user');
    },
    deleteCustomAssignee: async (id) => {
        const result = await CustomAssignee.findByIdAndDelete(id);
        return !!result;
    }
};
