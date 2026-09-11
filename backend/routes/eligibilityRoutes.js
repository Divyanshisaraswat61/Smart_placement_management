const express = require("express");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    checkEligibility,
} = require("../controllers/eligibilityController");

const router = express.Router();

router.get(
    "/:jobId",
    protect,
    authorize("student"),
    checkEligibility
);

module.exports = router;