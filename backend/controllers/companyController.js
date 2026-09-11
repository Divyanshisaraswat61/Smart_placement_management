const Company = require("../models/Company");

const createCompany = async (req, res) => {
    try {
        const company = await Company.create({
            ...req.body,
            createdBy: req.user.id,
        });

        res.status(201).json({
            message: "Company created successfully",
            company,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create company",
            error: error.message,
        });
    }
};

const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json(companies);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch companies",
            error: error.message,
        });
    }
};

module.exports = {
    createCompany,
    getCompanies,
};