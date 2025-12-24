// src/models/comment.model.js
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: Number, required: true, index: true },  // PostgreSQL User.id
    
    // Can belong to task OR project
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    
    // Threading support
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    
    // Reactions
    reactions: {
        thumbsUp: { type: Number, default: 0 },
        heart: { type: Number, default: 0 },
        celebrate: { type: Number, default: 0 }
    },
    
    // Who reacted (to prevent duplicate reactions)
    reactedBy: [{
        userId: Number,
        reaction: String
    }],
    
    // Edit history
    edited: { type: Boolean, default: false },
    editedAt: Date,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes for performance
CommentSchema.index({ taskId: 1, createdAt: 1 });
CommentSchema.index({ projectId: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });

// Virtual for replies
CommentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentId'
});

export default mongoose.model('Comment', CommentSchema);
