const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        college: {
            type: String,
            required: true,
        },

        branch: {
            type: String,
            required: true,
        },

        graduationYear: {
            type: Number,
            required: true,
        },

        cgpa: {
            type: Number,
            required: true,
            min: 0,
            max: 10,
        },

        backlogs: {
            type: Number,
            default: 0,
        },

        skills: {
            type: [String],
            default: [],
        },

        phone: {
            type: String,
        },

        bio: {
            type: String,
        },

        resumeUrl: {
            type: String,
            default: "",
        },

        placementStatus: {
            type: String,
            enum: ["not_placed", "placed", "seeking"],
            default: "seeking",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);