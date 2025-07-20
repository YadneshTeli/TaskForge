// src/models/custom/customStatus.model.js
const mongoose = require('mongoose');

const CustomStatusSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model('CustomStatus', CustomStatusSchema);
