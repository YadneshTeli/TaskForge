// src/services/comment.service.js
// Service for handling comment-related logic

const Comment = require('../models/comment.model');

module.exports = {
    addComment: async (taskId, content, authorId, projectId = null) => {
        const comment = new Comment({
            content,
            author: authorId,
            task: taskId,
            project: projectId
        });
        return await comment.save();
    },
    deleteComment: async (commentId) => {
        const result = await Comment.findByIdAndDelete(commentId);
        return !!result;
    },
    getTaskComments: async (taskId) => {
        return await Comment.find({ task: taskId }).populate('author');
    }
};
