// src/models/custom/customLabel.model.js
const mongoose = require('mongoose');

const CustomLabelSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model('CustomLabel', CustomLabelSchema);
