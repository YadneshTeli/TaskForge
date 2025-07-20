// src/models/project.model.js
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    dueDate: Date,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    logs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    attachments: [String]
});

module.exports = mongoose.model('Project', ProjectSchema);
