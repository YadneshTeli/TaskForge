const router = require("express").Router();
const { verifyToken } = require("../middleware/auth.middleware");
const projectController = require("../services/project.service");

router.post("/create", verifyToken, projectController.createProject);
router.get("/all", verifyToken, projectController.getUserProjects);
router.get("/export/:id", verifyToken, projectController.generatePdfReport);

module.exports = router;