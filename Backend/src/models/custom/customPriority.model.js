// src/models/custom/customPriority.model.js
const mongoose = require('mongoose');

const CustomPrioritySchema = new mongoose.Schema({
    level: { type: String, required: true }
});

module.exports = mongoose.model('CustomPriority', CustomPrioritySchema);
