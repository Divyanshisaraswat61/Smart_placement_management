const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        status: {
            type: String,
            enum: [
                "applied",
                "shortlisted",
                "rejected",
                "selected",
            ],
            default: "applied",
        },

        appliedAt: {
            type: Date,
            default: Date.now,
        },

        remarks: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Same student shouldn't apply to the same job twice
applicationSchema.index(
    { student: 1, job: 1 },
    { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);