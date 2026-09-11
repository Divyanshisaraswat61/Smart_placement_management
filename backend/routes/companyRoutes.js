const express = require("express");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    createCompany,
    getCompanies,
} = require("../controllers/companyController");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin", "recruiter"),
    createCompany
);

router.get(
    "/",
    protect,
    getCompanies
);

module.exports = router;