const prisma = require("../config/prismaClient");
const { sendOTP } = require("../utils/email");

if (!prisma) {
  console.error("Prisma Client is not initialized");
}

async function requestOTP(req, res) {
  try {
    if (!prisma) {
      return res.status(500).json({ error: "Database connection not available" });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingVerification = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (existingVerification) {
      await prisma.emailVerification.update({
        where: { email },
        data: {
          otp,
          expiresAt,
          verified: false,
        },
      });
    } else {
      await prisma.emailVerification.create({
        data: {
          email,
          otp,
          expiresAt,
        },
      });
    }

    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    res.json({ message: "OTP sent" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ 
      error: error.message || "Failed to send OTP",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!verification) {
      return res.status(400).json({ error: "OTP not found. Please request a new one." });
    }

    if (new Date() > verification.expiresAt) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (verification.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await prisma.emailVerification.update({
      where: { email },
      data: { verified: true },
    });

    res.json({ verified: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
}

module.exports = {
  requestOTP,
  verifyOTP,
};

