// src/services/user.service.js
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

module.exports = {
    updateProfile: async (id, updates) => {
        return await User.findByIdAndUpdate(id, updates, { new: true });
    },
    resetPassword: async (id, newPassword) => {
        // Password strength check
        if (!newPassword || newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            throw new Error('Password must be at least 8 characters, include a number and an uppercase letter.');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        return await User.findByIdAndUpdate(id, { password: hashed }, { new: true });
    },
    getUserById: async (id) => {
        return await User.findById(id);
    }
};
