// src/services/custom/customTag.service.js
const CustomTag = require('../../models/custom/customTag.model');

module.exports = {
    createCustomTag: async (name) => {
        const tag = new CustomTag({ name });
        return await tag.save();
    },
    getCustomTags: async () => {
        return await CustomTag.find();
    },
    updateCustomTag: async (id, updates) => {
        return await CustomTag.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteCustomTag: async (id) => {
        const result = await CustomTag.findByIdAndDelete(id);
        return !!result;
    }
};
