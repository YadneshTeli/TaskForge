import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import taskService from "../services/task.service.js";
import Task from "../models/task.model.js";
import asyncHandler from '../utils/asyncHandler.js';

// Normalize task status ('in progress' -> 'in-progress', 'completed' -> 'done')
function normalizeTaskInput(data, userId) {
  const payload = { ...data };
  if (payload.status) {
    const s = String(payload.status).toLowerCase().trim();
    if (s === 'in progress' || s === 'in_progress') payload.status = 'in-progress';
    else if (s === 'completed') payload.status = 'done';
    else payload.status = s;
  }
  if (payload.priority) {
    payload.priority = String(payload.priority).toLowerCase().trim();
  }
  if (payload.assignedTo !== undefined && payload.assignedTo !== null && payload.assignedTo !== '') {
    payload.assignedTo = parseInt(payload.assignedTo, 10);
  }
  if (userId && !payload.createdBy) {
    payload.createdBy = userId;
  }
  return payload;
}

// Create a task (POST / or POST /create)
const handleCreateTask = asyncHandler(async (req, res) => {
  const taskData = normalizeTaskInput(req.body, req.user.id);
  const task = await taskService.createTask(taskData);
  res.status(201).json(task);
});

router.post("/", protect, handleCreateTask);
router.post("/create", protect, handleCreateTask);

// Get tasks assigned to current user
router.get("/my-tasks", protect, asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(tasks);
}));

// Get tasks by projectId
router.get("/project/:projectId", protect, asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasksByProject(req.params.projectId, req.query);
  res.json(tasks);
}));

// Get task analytics
router.get("/project/:projectId/analytics", protect, asyncHandler(async (req, res) => {
  const analytics = await taskService.getTaskAnalytics(req.params.projectId, req.query);
  res.json(analytics);
}));

// Get single task by ID
router.get("/:id", protect, asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.json(task);
}));

// Update a task
router.put("/:id", protect, asyncHandler(async (req, res) => {
  const updateData = normalizeTaskInput(req.body);
  const task = await taskService.updateTask(req.params.id, updateData);
  res.json(task);
}));

// Assign task to a user
router.patch("/:id/assign", protect, asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const parsedUserId = userId !== null && userId !== undefined ? parseInt(userId, 10) : null;
  const task = await taskService.assignTaskToUser(req.params.id, parsedUserId);
  res.json(task);
}));

// Update task status
router.patch("/:id/status", protect, asyncHandler(async (req, res) => {
  const { status } = normalizeTaskInput({ status: req.body.status });
  const task = await taskService.updateTaskStatus(req.params.id, status);
  res.json(task);
}));

// Update task priority
router.patch("/:id/priority", protect, asyncHandler(async (req, res) => {
  const { priority } = normalizeTaskInput({ priority: req.body.priority });
  const task = await taskService.updateTask(req.params.id, { priority });
  res.json(task);
}));

// Add a watcher to a task
router.post("/:id/watchers", protect, asyncHandler(async (req, res) => {
  const userId = parseInt(req.body.userId || req.user.id, 10);
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { watchers: userId } },
    { new: true }
  );
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.json(task);
}));

// Remove a watcher from a task
router.delete("/:id/watchers/:userId", protect, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $pull: { watchers: userId } },
    { new: true }
  );
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.json(task);
}));

// Delete a task
router.delete("/:id", protect, asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.json({ message: "Task deleted successfully" });
}));

export default router;
