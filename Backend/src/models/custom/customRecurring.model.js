// src/models/custom/customRecurring.model.js
const mongoose = require('mongoose');

const CustomRecurringSchema = new mongoose.Schema({
    pattern: { type: String, required: true }
});

module.exports = mongoose.model('CustomRecurring', CustomRecurringSchema);
