const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", authRequired, dashboardController.getSummary);

module.exports = router;

