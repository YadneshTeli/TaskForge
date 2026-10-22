import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import commentService from "../services/comment.service.js";
import Comment from "../models/comment.model.js";
import asyncHandler from '../utils/asyncHandler.js';

// Create comment (POST / or POST /create)
const handleCreateComment = asyncHandler(async (req, res) => {
  const commentData = {
    ...req.body,
    content: req.body.content || req.body.text,
    author: req.user.id
  };
  const comment = await commentService.createComment(commentData);
  res.status(201).json(comment);
});

router.post("/", protect, handleCreateComment);
router.post("/create", protect, handleCreateComment);

// Get comments by task
router.get("/task/:taskId", protect, asyncHandler(async (req, res) => {
  const comments = await commentService.getTaskComments(req.params.taskId);
  res.json(comments);
}));

// Get comments by project
router.get("/project/:projectId", protect, asyncHandler(async (req, res) => {
  const comments = await commentService.getProjectComments(req.params.projectId);
  res.json(comments);
}));

// Update comment
router.put("/:id", protect, asyncHandler(async (req, res) => {
  const content = req.body.content || req.body.text;
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { content, edited: true, editedAt: new Date() },
    { new: true }
  ).lean();

  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }
  res.json({ ...comment, text: comment.content });
}));

// Add reaction to comment
router.post("/:id/reactions", protect, asyncHandler(async (req, res) => {
  const reaction = req.body.reaction || req.body.emoji || 'thumbsUp';
  const comment = await commentService.addReaction(req.params.id, req.user.id, reaction);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }
  res.json(comment);
}));

// Remove reaction from comment
router.delete("/:id/reactions/:emoji", protect, asyncHandler(async (req, res) => {
  const comment = await commentService.addReaction(req.params.id, req.user.id, req.params.emoji);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }
  res.json(comment);
}));

// Delete comment
router.delete("/:id", protect, asyncHandler(async (req, res) => {
  const success = await commentService.deleteComment(req.params.id);
  if (!success) {
    return res.status(404).json({ message: "Comment not found" });
  }
  res.json({ message: "Comment deleted" });
}));

export default router;
