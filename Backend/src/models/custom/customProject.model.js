// src/models/custom/customProject.model.js
const mongoose = require('mongoose');

const CustomProjectSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model('CustomProject', CustomProjectSchema);
