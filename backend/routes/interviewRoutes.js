const express = require("express");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    scheduleInterview,
    getMyInterviews,
    getAllInterviews,
    updateInterview,
} = require("../controllers/interviewController");

const router = express.Router();

// Admin / recruiter schedules interview
router.post(
    "/schedule/:applicationId",
    protect,
    authorize("admin", "recruiter"),
    scheduleInterview
);

// Student sees own interviews
router.get(
    "/my",
    protect,
    authorize("student"),
    getMyInterviews
);

// Admin / recruiter sees all interviews
router.get(
    "/",
    protect,
    authorize("admin", "recruiter"),
    getAllInterviews
);

// Admin / recruiter updates interview
router.put(
    "/:id",
    protect,
    authorize("admin", "recruiter"),
    updateInterview
);

module.exports = router;