const express = require("express");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    applyForJob,
    getMyApplications,
    getAllApplications,
    updateApplicationStatus,
} = require("../controllers/applicationController");

const router = express.Router();

// Student applies for a job
router.post(
    "/apply/:jobId",
    protect,
    authorize("student"),
    applyForJob
);

// Student sees own applications
router.get(
    "/my",
    protect,
    authorize("student"),
    getMyApplications
);

// Admin/recruiter sees all applications
router.get(
    "/",
    protect,
    authorize("admin", "recruiter"),
    getAllApplications
);

// Admin/recruiter updates application
router.put(
    "/:id/status",
    protect,
    authorize("admin", "recruiter"),
    updateApplicationStatus
);

module.exports = router;