const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        package: {
            type: String,
            required: true,
        },

        joiningDate: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["offer_received", "joined", "withdrawn"],
            default: "offer_received",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Placement", placementSchema);