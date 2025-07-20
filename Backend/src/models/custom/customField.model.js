// src/models/custom/customField.model.js
const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true }
});

module.exports = mongoose.model('CustomField', CustomFieldSchema);
