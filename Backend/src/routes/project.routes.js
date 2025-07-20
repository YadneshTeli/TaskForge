const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const projectController = require("../services/project.service");

router.post("/create", protect, projectController.createProject);
router.get("/all", protect, projectController.getUserProjects);
router.get("/export/:id", protect, projectController.generatePdfReport);

module.exports = router;