// src/models/log.model.js
import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
});

export default mongoose.model('Log', LogSchema);
