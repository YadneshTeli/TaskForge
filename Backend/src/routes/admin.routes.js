const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

// Example admin-only route
router.post("/admin-action", protect, role(["admin"]), (req, res) => {
    // Only accessible by users with role 'admin'
    res.json({ message: "Admin action performed." });
});

module.exports = router;
