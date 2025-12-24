// src/services/comment.service.js
// Service for handling comment-related logic with hybrid MongoDB approach

import Comment from '../models/comment.model.js';

class CommentService {
    async createComment(commentData) {
        const comment = await Comment.create(commentData);
        return await Comment.findById(comment._id)
            .populate('author', 'username email')
            .lean();
    }

    async getTaskComments(taskId) {
        return await Comment.find({ task: taskId })
            .populate('author', 'username email')
            .lean();
    }

    async deleteComment(commentId) {
        const comment = await Comment.findByIdAndDelete(commentId);
        return !!comment;
    }

    // Legacy methods for backward compatibility
    async addComment(taskId, content, authorId, projectId = null) {
        const commentData = {
            text: content, // Updated field name
            author: authorId,
            task: taskId,
            project: projectId
        };
        return await this.createComment(commentData);
    }
}

export default new CommentService();
