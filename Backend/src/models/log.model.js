// src/models/log.model.js
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
});

module.exports = mongoose.model('Log', LogSchema);
