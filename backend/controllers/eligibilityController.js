const Job = require("../models/Job");
const StudentProfile = require("../models/StudentProfile");

const checkEligibility = async (req, res) => {
    try {
        const { jobId } = req.params;

        const student = await StudentProfile.findOne({
            user: req.user.id,
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found",
            });
        }

        const job = await Job.findById(jobId).populate(
            "company",
            "name"
        );

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        const reasons = [];

        // CGPA check
        if (student.cgpa < job.minimumCGPA) {
            reasons.push(
                `Minimum CGPA required: ${job.minimumCGPA}`
            );
        }

        // Backlogs check
        if (student.backlogs > job.maximumBacklogs) {
            reasons.push(
                `Maximum backlogs allowed: ${job.maximumBacklogs}`
            );
        }

        // Branch check
        if (
            job.eligibleBranches.length > 0 &&
            !job.eligibleBranches.some(
                (branch) =>
                    branch.toLowerCase() ===
                    student.branch.toLowerCase()
            )
        ) {
            reasons.push(
                `Eligible branches: ${job.eligibleBranches.join(", ")}`
            );
        }

        // Graduation year check
        if (student.graduationYear !== job.graduationYear) {
            reasons.push(
                `Graduation year required: ${job.graduationYear}`
            );
        }

        // Skills check
        const studentSkills = student.skills.map((skill) =>
            skill.toLowerCase()
        );

        const missingSkills = job.requiredSkills.filter(
            (requiredSkill) =>
                !studentSkills.includes(
                    requiredSkill.toLowerCase()
                )
        );

        if (missingSkills.length > 0) {
            reasons.push(
                `Missing skills: ${missingSkills.join(", ")}`
            );
        }

        const eligible = reasons.length === 0;

        res.json({
            eligible,
            student: {
                cgpa: student.cgpa,
                branch: student.branch,
                graduationYear: student.graduationYear,
                backlogs: student.backlogs,
                skills: student.skills,
            },
            job: {
                title: job.title,
                company: job.company?.name,
            },
            reasons,
            missingSkills,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to check eligibility",
            error: error.message,
        });
    }
};

module.exports = {
    checkEligibility,
};