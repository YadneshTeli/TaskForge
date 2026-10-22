// src/models/notification.model.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    content: { type: String, required: true },
    type: { type: String, default: 'system_update' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    user: { type: Number, required: true, index: true } // PostgreSQL User.id
});

export default mongoose.model('Notification', NotificationSchema);
