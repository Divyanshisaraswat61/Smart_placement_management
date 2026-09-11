const express = require("express");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user,
    });
});

router.get("/admin-test", protect, authorize("admin"), (req, res) => {
    res.json({
        message: "Welcome Admin",
        user: req.user,
    });
});

router.get("/student-test", protect, authorize("student"), (req, res) => {
    res.json({
        message: "Welcome Student",
        user: req.user,
    });
});

module.exports = router;