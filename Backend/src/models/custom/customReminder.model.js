// src/models/custom/customReminder.model.js
const mongoose = require('mongoose');

const CustomReminderSchema = new mongoose.Schema({
    time: { type: String, required: true }
});

module.exports = mongoose.model('CustomReminder', CustomReminderSchema);
