// src/services/comment.service.js
// Service for handling comment-related logic with MongoDB

import Comment from '../models/comment.model.js';

class CommentService {
    async createComment(commentData) {
        const comment = await Comment.create(commentData);
        return await Comment.findById(comment._id).lean();
    }

    async getTaskComments(taskId) {
        return await Comment.find({ taskId: taskId }).lean();
    }

    async getProjectComments(projectId) {
        return await Comment.find({ projectId: projectId }).lean();
    }

    async deleteComment(commentId) {
        const comment = await Comment.findByIdAndDelete(commentId);
        return !!comment;
    }

    async addReaction(commentId, userId, reaction) {
        const comment = await Comment.findById(commentId);
        if (!comment) return null;
        
        // Check if user already reacted
        const existingReaction = comment.reactedBy.find(r => r.userId === userId);
        if (existingReaction) {
            if (existingReaction.reaction === reaction) {
                // Remove reaction
                comment.reactedBy = comment.reactedBy.filter(r => r.userId !== userId);
                comment.reactions[reaction]--;
            } else {
                // Change reaction
                comment.reactions[existingReaction.reaction]--;
                comment.reactions[reaction]++;
                existingReaction.reaction = reaction;
            }
        } else {
            // Add new reaction
            comment.reactedBy.push({ userId, reaction });
            comment.reactions[reaction]++;
        }
        
        await comment.save();
        return comment;
    }

    // Legacy methods for backward compatibility
    async addComment(taskId, content, authorId, projectId = null) {
        const commentData = {
            text: content,
            author: authorId,
            taskId: taskId,
            projectId: projectId
        };
        return await this.createComment(commentData);
    }
}

export default new CommentService();
