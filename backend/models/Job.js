const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        eligibleBranches: {
            type: [String],
            default: [],
        },

        minimumCGPA: {
            type: Number,
            default: 0,
        },

        maximumBacklogs: {
            type: Number,
            default: 0,
        },

        requiredSkills: {
            type: [String],
            default: [],
        },

        graduationYear: {
            type: Number,
            required: true,
        },

        salary: {
            type: String,
        },

        applicationDeadline: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Job", jobSchema);