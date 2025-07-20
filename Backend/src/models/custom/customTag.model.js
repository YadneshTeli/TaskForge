// src/models/custom/customTag.model.js
const mongoose = require('mongoose');

const CustomTagSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model('CustomTag', CustomTagSchema);
