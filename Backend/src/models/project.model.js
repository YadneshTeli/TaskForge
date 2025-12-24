// src/models/project.model.js
import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: String,
    status: { 
        type: String, 
        enum: ['active', 'completed', 'archived', 'on-hold'],
        default: 'active',
        index: true
    },
    
    // PostgreSQL User references (store IDs only)
    owner: { type: Number, required: true, index: true },  // PostgreSQL User.id
    members: [{ type: Number }],  // Array of PostgreSQL User.id
    
    // Project settings (embedded - no joins needed)
    settings: {
        taskStatuses: { type: [String], default: ['todo', 'in-progress', 'done'] },
        taskPriorities: { type: [String], default: ['low', 'medium', 'high'] },
        customFields: [{
            name: String,
            type: { type: String, enum: ['text', 'number', 'date', 'dropdown'] },
            options: [String]
        }],
        timezone: { type: String, default: 'UTC' },
        notifications: {
            emailOnAssign: { type: Boolean, default: true },
            emailOnComment: { type: Boolean, default: true }
        }
    },
    
    // Dates
    dueDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    archivedAt: Date,
    
    // Quick stats (cached, updated on task changes)
    stats: {
        taskCount: { type: Number, default: 0 },
        completedTasks: { type: Number, default: 0 },
        memberCount: { type: Number, default: 0 }
    },
    
    // Attachments
    attachments: [{
        url: String,
        filename: String,
        uploadedBy: Number,  // PostgreSQL User.id
        uploadedAt: Date
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate tasks
ProjectSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'projectId'
});

// Indexes for performance
ProjectSchema.index({ owner: 1, status: 1 });
ProjectSchema.index({ members: 1 });
ProjectSchema.index({ createdAt: -1 });

// Update member count and updatedAt before saving
ProjectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.members) {
        this.stats.memberCount = this.members.length;
    }
    next();
});

export default mongoose.model('Project', ProjectSchema);
