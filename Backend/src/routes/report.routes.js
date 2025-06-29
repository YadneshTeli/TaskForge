const router = require("express").Router();
const PDFDocument = require("pdfkit");
const { protect } = require("../middleware/auth.middleware");

router.get("/export/:projectId", protect, async (req, res) => {
    const { projectId } = req.params;
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=project_${projectId}.pdf`);
    doc.text(`Project Report for Project ID: ${projectId}`);
    doc.text("Generated at: " + new Date().toISOString());
    doc.pipe(res);
    doc.end();
});

module.exports = router;
