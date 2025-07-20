// src/models/notification.model.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    content: { type: String, required: true },
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Notification', NotificationSchema);
