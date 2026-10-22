// src/services/comment.service.js
// Service for handling comment-related logic with MongoDB

import Comment from '../models/comment.model.js';

class CommentService {
    async createComment(commentData) {
        const normalized = {
            ...commentData,
            content: commentData.content || commentData.text
        };
        const comment = await Comment.create(normalized);
        const saved = await Comment.findById(comment._id).lean();
        return saved ? { ...saved, id: saved._id.toString(), text: saved.content } : null;
    }

    async getTaskComments(taskId) {
        const comments = await Comment.find({ taskId: taskId }).sort({ createdAt: 1 }).lean();
        return comments.map(c => ({ ...c, id: c._id.toString(), text: c.content }));
    }

    async getProjectComments(projectId) {
        const comments = await Comment.find({ projectId: projectId }).sort({ createdAt: 1 }).lean();
        return comments.map(c => ({ ...c, id: c._id.toString(), text: c.content }));
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
                if (comment.reactions[reaction] !== undefined) {
                    comment.reactions[reaction] = Math.max(0, comment.reactions[reaction] - 1);
                }
            } else {
                // Change reaction
                if (comment.reactions[existingReaction.reaction] !== undefined) {
                    comment.reactions[existingReaction.reaction] = Math.max(0, comment.reactions[existingReaction.reaction] - 1);
                }
                if (comment.reactions[reaction] !== undefined) {
                    comment.reactions[reaction]++;
                }
                existingReaction.reaction = reaction;
            }
        } else {
            // Add new reaction
            comment.reactedBy.push({ userId, reaction });
            if (comment.reactions[reaction] !== undefined) {
                comment.reactions[reaction]++;
            }
        }
        
        await comment.save();
        return comment;
    }

    // Legacy methods for backward compatibility
    async addComment(taskId, content, authorId, projectId = null) {
        const commentData = {
            content: content,
            author: authorId,
            taskId: taskId,
            projectId: projectId
        };
        return await this.createComment(commentData);
    }
}

export default new CommentService();
