const StudentProfile = require("../models/StudentProfile");

// Create student profile
const createProfile = async (req, res) => {
    try {
        const existingProfile = await StudentProfile.findOne({
            user: req.user.id,
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "Student profile already exists",
            });
        }

        const profile = await StudentProfile.create({
            user: req.user.id,
            ...req.body,
        });

        res.status(201).json({
            message: "Student profile created successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create student profile",
            error: error.message,
        });
    }
};

// Get logged-in student's profile
const getProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
            user: req.user.id,
        }).populate("user", "name email role");

        if (!profile) {
            return res.status(404).json({
                message: "Student profile not found",
            });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch student profile",
            error: error.message,
        });
    }
};

// Update logged-in student's profile
const updateProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
            user: req.user.id,
        });

        if (!profile) {
            return res.status(404).json({
                message: "Student profile not found",
            });
        }

        Object.assign(profile, req.body);

        const updatedProfile = await profile.save();

        res.json({
            message: "Student profile updated successfully",
            profile: updatedProfile,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update student profile",
            error: error.message,
        });
    }
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile,
};