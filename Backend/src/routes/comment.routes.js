const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const commentService = require("../services/comment.service");
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('../middleware/rateLimit.middleware');

router.use(helmet());
router.use(xss());
router.use(rateLimit);

// Create comment
router.post("/", protect, async (req, res) => {
  try {
    const commentData = {
      ...req.body,
      author: req.user.id
    };
    const comment = await commentService.createComment(commentData);
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get comments by task
router.get("/task/:taskId", protect, async (req, res) => {
  try {
    const comments = await commentService.getTaskComments(req.params.taskId);
    res.json(comments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete comment
router.delete("/:id", protect, async (req, res) => {
  try {
    const success = await commentService.deleteComment(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
