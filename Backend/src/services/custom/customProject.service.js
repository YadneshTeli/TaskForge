// src/services/custom/customProject.service.js
const CustomProject = require('../../models/custom/customProject.model');

module.exports = {
    createCustomProject: async (name) => {
        const project = new CustomProject({ name });
        return await project.save();
    },
    getCustomProjects: async () => {
        return await CustomProject.find();
    },
    updateCustomProject: async (id, updates) => {
        return await CustomProject.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteCustomProject: async (id) => {
        const result = await CustomProject.findByIdAndDelete(id);
        return !!result;
    }
};
