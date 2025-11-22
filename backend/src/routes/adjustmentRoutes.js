const express = require("express");
const adjustmentController = require("../controllers/adjustmentController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authRequired, adjustmentController.getAllAdjustments);
router.post("/", authRequired, adjustmentController.createAdjustment);

module.exports = router;

