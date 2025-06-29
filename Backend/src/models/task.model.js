const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: Date,
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    projectId: Number,
    assignedTo: Number,
    attachments: [String],
    comments: [
        {
            userId: Number,
            text: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("Task", TaskSchema);