import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    
    // Status & Priority (can be custom per project)
    status: { type: String, default: 'todo', index: true },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'], 
        default: 'medium',
        index: true
    },
    
    // References - MongoDB Project._id and PostgreSQL User IDs
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assignedTo: { type: Number, index: true },  // PostgreSQL User.id
    createdBy: { type: Number, required: true },  // PostgreSQL User.id
    
    // Flexible arrays
    tags: [{ type: String, index: true }],
    watchers: [Number],  // Array of PostgreSQL User.id
    attachments: [{
        url: String,
        filename: String,
        size: Number,
        uploadedBy: Number,  // PostgreSQL User.id
        uploadedAt: Date
    }],
    
    // Custom fields (completely dynamic per project)
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    
    // Embedded inline comments (for quick comments)
    inlineComments: [{
        userId: Number,  // PostgreSQL User.id
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    
    // Dates
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, index: true },
    completedAt: Date,
    
    // For subtasks
    parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    order: Number  // For ordering within project
}, {
    timestamps: true
});

// Indexes for common queries
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ projectId: 1, assignedTo: 1 });
TaskSchema.index({ tags: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });

// Update project stats when task is saved
TaskSchema.post('save', async function() {
    const Project = mongoose.model('Project');
    const taskCount = await mongoose.model('Task').countDocuments({ projectId: this.projectId });
    const completedTasks = await mongoose.model('Task').countDocuments({ 
        projectId: this.projectId, 
        status: 'done' 
    });
    
    await Project.findByIdAndUpdate(this.projectId, {
        'stats.taskCount': taskCount,
        'stats.completedTasks': completedTasks
    });
});

export default mongoose.model("Task", TaskSchema);