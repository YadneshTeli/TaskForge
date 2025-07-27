const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const taskService = require("../services/task.service");
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('../middleware/rateLimit.middleware');
const { body, validationResult } = require('express-validator');

router.use(helmet());
router.use(xss());
router.use(rateLimit);

// Create a task
router.post("/", protect, async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get tasks by projectId
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const tasks = await taskService.getTasksByProject(req.params.projectId);
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get task analytics
router.get("/project/:projectId/analytics", protect, async (req, res) => {
  try {
    const analytics = await taskService.getTaskAnalytics(req.params.projectId);
    res.json(analytics);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a task
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task
router.delete("/:id", protect, async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
