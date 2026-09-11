const express = require("express");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    createJob,
    getJobs,
    getJobsByCompany,
    getJobById,
} = require("../controllers/jobController");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin", "recruiter"),
    createJob
);

router.get(
    "/",
    protect,
    getJobs
);

// Get all jobs of a specific company
router.get(
    "/company/:companyId",
    protect,
    getJobsByCompany
);

router.get(
    "/:id",
    protect,
    getJobById
);

module.exports = router;