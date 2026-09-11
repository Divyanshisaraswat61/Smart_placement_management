const express = require("express");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    createPlacement,
    getMyPlacement,
    getAllPlacements,
    updatePlacement,
} = require("../controllers/placementController");

const router = express.Router();


/*
====================================================
CREATE PLACEMENT
Admin / Recruiter
====================================================
*/

router.post(
    "/create/:applicationId",
    protect,
    authorize("admin", "recruiter"),
    createPlacement
);


/*
====================================================
MY PLACEMENT
Student
====================================================
*/

router.get(
    "/my",
    protect,
    authorize("student"),
    getMyPlacement
);


/*
====================================================
ALL PLACEMENTS
Admin / Recruiter
====================================================
*/

router.get(
    "/",
    protect,
    authorize("admin", "recruiter"),
    getAllPlacements
);


/*
====================================================
UPDATE PLACEMENT
Admin / Recruiter
====================================================
*/

router.put(
    "/:id",
    protect,
    authorize("admin", "recruiter"),
    updatePlacement
);


module.exports = router;