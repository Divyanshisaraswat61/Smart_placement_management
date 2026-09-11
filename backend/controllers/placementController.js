const Placement = require("../models/Placement");
const Application = require("../models/Application");

/*
====================================================
CREATE PLACEMENT
POST /api/placements/create/:applicationId
Admin / Recruiter
====================================================
*/
const createPlacement = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const {
            package: packageValue,
            joiningDate,
            status,
        } = req.body;

        const application = await Application.findById(
            applicationId
        ).populate({
            path: "job",
            populate: {
                path: "company",
            },
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
            });
        }

        if (application.status?.toLowerCase() !== "selected") {
            return res.status(400).json({
                message:
                    "Placement can only be created for a selected application",
            });
        }

        if (!application.student) {
            return res.status(400).json({
                message:
                    "Student information is missing from application",
            });
        }

        if (!application.job) {
            return res.status(400).json({
                message: "Job information is missing from application",
            });
        }

        if (!application.job.company) {
            return res.status(400).json({
                message:
                    "Company information is missing from job",
            });
        }

        const existingPlacement =
            await Placement.findOne({
                application: applicationId,
            });

        if (existingPlacement) {
            return res.status(400).json({
                message:
                    "Placement already exists for this application",
            });
        }

        const placement = await Placement.create({
            student: application.student,
            application: application._id,
            company: application.job.company._id,
            job: application.job._id,
            package: packageValue || application.job.salary || "",
            joiningDate: joiningDate || null,
            status: status || "offer_received",
        });

        const populatedPlacement =
            await Placement.findById(placement._id)
                .populate("student", "name email")
                .populate("company", "name website location industry")
                .populate(
                    "job",
                    "title salary description"
                )
                .populate(
                    "application",
                    "status appliedAt createdAt"
                );

        res.status(201).json({
            message: "Placement created successfully",
            placement: populatedPlacement,
        });
    } catch (error) {
        console.error(
            "Create placement error:",
            error
        );

        res.status(500).json({
            message: "Failed to create placement",
            error: error.message,
        });
    }
};


/*
====================================================
GET MY PLACEMENT
GET /api/placements/my
Student
====================================================
*/
const getMyPlacement = async (req, res) => {
    try {
        const placements =
            await Placement.find({
                student: req.user.id,
            })
                .populate(
                    "student",
                    "name email"
                )
                .populate(
                    "company",
                    "name website location industry"
                )
                .populate(
                    "job",
                    "title salary description"
                )
                .populate(
                    "application",
                    "status appliedAt createdAt"
                )
                .sort({
                    createdAt: -1,
                });

        res.json(placements);
    } catch (error) {
        console.error(
            "Get my placement error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch your placement",
            error: error.message,
        });
    }
};


/*
====================================================
GET ALL PLACEMENTS
GET /api/placements
Admin / Recruiter
====================================================
*/
const getAllPlacements = async (req, res) => {
    try {
        const placements =
            await Placement.find()
                .populate(
                    "student",
                    "name email"
                )
                .populate(
                    "company",
                    "name website location industry"
                )
                .populate(
                    "job",
                    "title salary description"
                )
                .populate(
                    "application",
                    "status appliedAt createdAt"
                )
                .sort({
                    createdAt: -1,
                });

        res.json(placements);
    } catch (error) {
        console.error(
            "Get all placements error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch placements",
            error: error.message,
        });
    }
};


/*
====================================================
UPDATE PLACEMENT
PUT /api/placements/:id
Admin / Recruiter
====================================================
*/
const updatePlacement = async (req, res) => {
    try {
        const {
            package: packageValue,
            joiningDate,
            status,
        } = req.body;

        const placement =
            await Placement.findById(
                req.params.id
            );

        if (!placement) {
            return res.status(404).json({
                message: "Placement not found",
            });
        }

        if (packageValue !== undefined) {
            placement.package =
                packageValue;
        }

        if (joiningDate !== undefined) {
            placement.joiningDate =
                joiningDate || null;
        }

        if (status !== undefined) {
            placement.status = status;
        }

        await placement.save();

        const updatedPlacement =
            await Placement.findById(
                placement._id
            )
                .populate(
                    "student",
                    "name email"
                )
                .populate(
                    "company",
                    "name website location industry"
                )
                .populate(
                    "job",
                    "title salary description"
                )
                .populate(
                    "application",
                    "status appliedAt createdAt"
                );

        res.json({
            message:
                "Placement updated successfully",
            placement: updatedPlacement,
        });
    } catch (error) {
        console.error(
            "Update placement error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update placement",
            error: error.message,
        });
    }
};


module.exports = {
    createPlacement,
    getMyPlacement,
    getAllPlacements,
    updatePlacement,
};