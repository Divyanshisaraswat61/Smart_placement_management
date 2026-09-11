const Interview = require("../models/Interview");
const Application = require("../models/Application");

const scheduleInterview = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const {
            scheduledAt,
            mode,
            location,
            meetingLink,
            interviewer,
        } = req.body;

        const application = await Application.findById(
            applicationId
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
            });
        }

        if (application.status !== "shortlisted") {
            return res.status(400).json({
                message:
                    "Interview can only be scheduled for shortlisted students",
            });
        }

        const existingInterview = await Interview.findOne({
            application: applicationId,
        });

        if (existingInterview) {
            return res.status(400).json({
                message: "Interview already scheduled",
            });
        }

        if (!scheduledAt || !mode) {
            return res.status(400).json({
                message: "scheduledAt and mode are required",
            });
        }

        if (mode === "online" && !meetingLink) {
            return res.status(400).json({
                message:
                    "Meeting link is required for online interview",
            });
        }

        if (mode === "offline" && !location) {
            return res.status(400).json({
                message:
                    "Location is required for offline interview",
            });
        }

        const interview = await Interview.create({
            application: applicationId,
            scheduledAt,
            mode,
            location,
            meetingLink,
            interviewer,
        });

        const populatedInterview =
            await Interview.findById(interview._id)
                .populate({
                    path: "application",
                    populate: [
                        {
                            path: "student",
                            select: "name email",
                        },
                        {
                            path: "job",
                            select: "title salary",
                        },
                    ],
                });

        res.status(201).json({
            message: "Interview scheduled successfully",
            interview: populatedInterview,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to schedule interview",
            error: error.message,
        });
    }
};

const getMyInterviews = async (req, res) => {
    try {
        const applications = await Application.find({
            student: req.user.id,
        }).select("_id");

        const applicationIds = applications.map(
            (application) => application._id
        );

        const interviews = await Interview.find({
            application: { $in: applicationIds },
        })
            .populate({
                path: "application",
                populate: {
                    path: "job",
                    select: "title salary",
                },
            })
            .sort({ scheduledAt: 1 });

        res.json(interviews);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch interviews",
            error: error.message,
        });
    }
};

const getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find()
            .populate({
                path: "application",
                populate: [
                    {
                        path: "student",
                        select: "name email",
                    },
                    {
                        path: "job",
                        select: "title salary",
                    },
                ],
            })
            .sort({ scheduledAt: 1 });

        res.json(interviews);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch interviews",
            error: error.message,
        });
    }
};

const updateInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(
            req.params.id
        );

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found",
            });
        }

        const allowedFields = [
            "scheduledAt",
            "mode",
            "location",
            "meetingLink",
            "interviewer",
            "status",
            "feedback",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                interview[field] = req.body[field];
            }
        });

        await interview.save();

        res.json({
            message: "Interview updated successfully",
            interview,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update interview",
            error: error.message,
        });
    }
};

module.exports = {
    scheduleInterview,
    getMyInterviews,
    getAllInterviews,
    updateInterview,
};