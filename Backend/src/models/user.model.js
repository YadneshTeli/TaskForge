// src/models/user.model.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    fullName: String,
    profilePicture: String,
    bio: String,
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,
    lastActiveAt: Date,
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

export default mongoose.model('User', UserSchema);
