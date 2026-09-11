const express = require("express");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    createProfile,
    getProfile,
    updateProfile,
} = require("../controllers/studentController");

const router = express.Router();

router.post(
    "/profile",
    protect,
    authorize("student"),
    createProfile
);

router.get(
    "/profile",
    protect,
    authorize("student"),
    getProfile
);

router.put(
    "/profile",
    protect,
    authorize("student"),
    updateProfile
);

module.exports = router;