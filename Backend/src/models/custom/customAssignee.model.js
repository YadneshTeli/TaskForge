// src/models/custom/customAssignee.model.js
const mongoose = require('mongoose');

const CustomAssigneeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('CustomAssignee', CustomAssigneeSchema);
