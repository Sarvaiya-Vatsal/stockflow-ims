const prisma = require("../config/prismaClient");
const bcrypt = require("bcryptjs");
const { sendPasswordResetOTP } = require("../utils/email");

async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingReset = await prisma.passwordReset.findUnique({
      where: { email },
    });

    if (existingReset) {
      await prisma.passwordReset.update({
        where: { email },
        data: {
          otp,
          expiresAt,
          verified: false,
        },
      });
    } else {
      await prisma.passwordReset.create({
        data: {
          email,
          otp,
          expiresAt,
        },
      });
    }

    await sendPasswordResetOTP(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

async function verifyPasswordResetOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const reset = await prisma.passwordReset.findUnique({
      where: { email },
    });

    if (!reset) {
      return res.status(400).json({ error: "OTP not found. Please request a new one." });
    }

    if (new Date() > reset.expiresAt) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (reset.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: { verified: true },
    });

    res.json({ verified: true });
  } catch (error) {
    console.error("Error verifying password reset OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const reset = await prisma.passwordReset.findUnique({
      where: { email },
    });

    if (!reset || !reset.verified) {
      return res.status(400).json({ error: "OTP not verified" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    await prisma.passwordReset.delete({
      where: { email },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

module.exports = {
  requestPasswordReset,
  verifyPasswordResetOTP,
  resetPassword,
};

