const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: Date,
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [String],
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("Task", TaskSchema);