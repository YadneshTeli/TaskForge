import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import taskService from "../services/task.service.js";
import asyncHandler from '../utils/asyncHandler.js';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from '../middleware/rateLimit.middleware.js';
import { body, validationResult } from 'express-validator';

router.use(helmet());
router.use(xss());
router.use(rateLimit);

// Create a task
router.post("/", protect, asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json(task);
}));

// Get tasks by projectId
router.get("/project/:projectId", protect, asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasksByProject(req.params.projectId);
  res.json(tasks);
}));

// Get task analytics
router.get("/project/:projectId/analytics", protect, asyncHandler(async (req, res) => {
  const analytics = await taskService.getTaskAnalytics(req.params.projectId);
  res.json(analytics);
}));

// Update a task
router.put("/:id", protect, asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.json(task);
}));

// Delete a task
router.delete("/:id", protect, asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.json({ message: "Task deleted" });
}));

export default router;
