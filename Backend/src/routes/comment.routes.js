import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import commentService from "../services/comment.service.js";
import asyncHandler from '../utils/asyncHandler.js';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from '../middleware/rateLimit.middleware.js';

router.use(helmet());
router.use(xss());
router.use(rateLimit);

// Create comment
router.post("/", protect, asyncHandler(async (req, res) => {
  const commentData = {
    ...req.body,
    author: req.user.id
  };
  const comment = await commentService.createComment(commentData);
  res.status(201).json(comment);
}));

// Get comments by task
router.get("/task/:taskId", protect, asyncHandler(async (req, res) => {
  const comments = await commentService.getTaskComments(req.params.taskId);
  res.json(comments);
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
