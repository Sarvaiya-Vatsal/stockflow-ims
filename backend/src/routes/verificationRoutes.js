const express = require("express");
const verificationController = require("../controllers/verificationController");

const router = express.Router();

router.post("/request-otp", verificationController.requestOTP);
router.post("/verify-otp", verificationController.verifyOTP);

module.exports = router;

