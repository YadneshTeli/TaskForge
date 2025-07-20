// src/services/custom/customField.service.js
const CustomField = require('../../models/custom/customField.model');

module.exports = {
    createCustomField: async (name, value) => {
        const field = new CustomField({ name, value });
        return await field.save();
    },
    getCustomFields: async () => {
        return await CustomField.find();
    },
    updateCustomField: async (id, updates) => {
        return await CustomField.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteCustomField: async (id) => {
        const result = await CustomField.findByIdAndDelete(id);
        return !!result;
    }
};
