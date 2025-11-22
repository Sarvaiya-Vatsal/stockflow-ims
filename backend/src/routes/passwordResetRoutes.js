const express = require("express");
const passwordResetController = require("../controllers/passwordResetController");

const router = express.Router();

router.post("/forgot-password", passwordResetController.requestPasswordReset);
router.post("/verify-reset-otp", passwordResetController.verifyPasswordResetOTP);
router.post("/reset-password", passwordResetController.resetPassword);

module.exports = router;

