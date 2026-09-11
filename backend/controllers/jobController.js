const Job = require("../models/Job");

const createJob = async (req, res) => {
    try {
        const job = await Job.create(req.body);

        const populatedJob = await Job.findById(job._id)
            .populate("company", "name website location");

        res.status(201).json({
            message: "Job created successfully",
            job: populatedJob,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create job",
            error: error.message,
        });
    }
};

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate("company", "name website location industry")
            .sort({ createdAt: -1 });

        res.json(jobs);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch jobs",
            error: error.message,
        });
    }
};

// Get jobs of a specific company
const getJobsByCompany = async (req, res) => {
    try {
        const jobs = await Job.find({
            company: req.params.companyId,
        })
            .populate("company", "name website location industry")
            .sort({ createdAt: -1 });

        res.json(jobs);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch company jobs",
            error: error.message,
        });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("company", "name website location industry");

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        res.json(job);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch job",
            error: error.message,
        });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobsByCompany,
    getJobById,
};