// src/models/log.model.js
// Activity log model for MongoDB
import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    userId: { type: Number, ref: 'User' }, // PostgreSQL User.id
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true }
});

// Indexes for efficient querying
LogSchema.index({ projectId: 1, createdAt: -1 });
LogSchema.index({ taskId: 1, createdAt: -1 });
LogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Log', LogSchema);
