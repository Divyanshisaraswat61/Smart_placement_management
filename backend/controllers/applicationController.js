const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");
const Job = require("../models/Job");

// Normalize skills so small formatting differences don't cause mismatch
const normalizeSkill = (skill) => {
    return String(skill || "")
        .toLowerCase()
        .trim()
        .replace(/[.#/+-]/g, "")
        .replace(/\s+/g, "");
};

// Apply for a job
const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Find student profile
        const student = await StudentProfile.findOne({
            user: req.user.id,
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found",
            });
        }

        // Find job
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        // Check job status
        if (job.status !== "open") {
            return res.status(400).json({
                message: "This job is no longer accepting applications",
            });
        }

        // Check application deadline
        if (
            job.applicationDeadline &&
            new Date() > new Date(job.applicationDeadline)
        ) {
            return res.status(400).json({
                message: "Application deadline has passed",
            });
        }

        // Check duplicate application
        const existingApplication = await Application.findOne({
            student: req.user.id,
            job: jobId,
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job",
            });
        }

        // -----------------------------
        // ELIGIBILITY CHECK
        // -----------------------------

        // CGPA check
        if (student.cgpa < job.minimumCGPA) {
            return res.status(400).json({
                message: `You are not eligible. Required CGPA: ${job.minimumCGPA}, Your CGPA: ${student.cgpa}`,
            });
        }

        // Backlogs check
        if (student.backlogs > job.maximumBacklogs) {
            return res.status(400).json({
                message: `You are not eligible due to backlogs. Maximum allowed: ${job.maximumBacklogs}, Your backlogs: ${student.backlogs}`,
            });
        }

        // Branch check
        if (
            job.eligibleBranches &&
            job.eligibleBranches.length > 0
        ) {
            const studentBranch = String(student.branch || "")
                .trim()
                .toLowerCase();

            const eligibleBranches = job.eligibleBranches.map(
                (branch) =>
                    String(branch || "")
                        .trim()
                        .toLowerCase()
            );

            if (!eligibleBranches.includes(studentBranch)) {
                return res.status(400).json({
                    message: `Your branch is not eligible. Your branch: ${student.branch}`,
                });
            }
        }

        // Graduation year check
        if (
            Number(student.graduationYear) !==
            Number(job.graduationYear)
        ) {
            return res.status(400).json({
                message: `Your graduation year is not eligible. Required: ${job.graduationYear}, Your year: ${student.graduationYear}`,
            });
        }

        // -----------------------------
        // SKILLS CHECK
        // -----------------------------

        const studentSkills = (student.skills || [])
            .map(normalizeSkill)
            .filter(Boolean);

        const requiredSkills = (job.requiredSkills || [])
            .filter(Boolean);

        const missingSkills = requiredSkills.filter(
            (requiredSkill) => {
                const normalizedRequiredSkill =
                    normalizeSkill(requiredSkill);

                return !studentSkills.some(
                    (studentSkill) =>
                        studentSkill === normalizedRequiredSkill ||
                        studentSkill.includes(normalizedRequiredSkill) ||
                        normalizedRequiredSkill.includes(studentSkill)
                );
            }
        );

        if (missingSkills.length > 0) {
            return res.status(400).json({
                message: `You are missing required skills: ${missingSkills.join(
                    ", "
                )}`,
                missingSkills,
            });
        }

        // -----------------------------
        // CREATE APPLICATION
        // -----------------------------

        const application = await Application.create({
            student: req.user.id,
            job: jobId,
        });

        // Populate application details
        const populatedApplication =
            await Application.findById(application._id)
                .populate("student", "name email")
                .populate(
                    "job",
                    "title company salary"
                );

        res.status(201).json({
            message: "Application submitted successfully",
            application: populatedApplication,
        });
    } catch (error) {
        console.error("Apply for job error:", error);

        res.status(500).json({
            message: "Failed to apply for job",
            error: error.message,
        });
    }
};

// Get logged-in student's applications
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            student: req.user.id,
        })
            .populate(
                "job",
                "title company salary status"
            )
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch applications",
            error: error.message,
        });
    }
};

// Get all applications
const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate("student", "name email")
            .populate(
                "job",
                "title company salary"
            )
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch applications",
            error: error.message,
        });
    }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const allowedStatuses = [
            "applied",
            "shortlisted",
            "rejected",
            "selected",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status",
            });
        }

        const application = await Application.findById(
            req.params.id
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
            });
        }

        application.status = status;

        if (remarks !== undefined) {
            application.remarks = remarks;
        }

        await application.save();

        const updatedApplication =
            await Application.findById(application._id)
                .populate("student", "name email")
                .populate(
                    "job",
                    "title company salary"
                );

        res.json({
            message: "Application status updated successfully",
            application: updatedApplication,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update application status",
            error: error.message,
        });
    }
};

module.exports = {
    applyForJob,
    getMyApplications,
    getAllApplications,
    updateApplicationStatus,
};