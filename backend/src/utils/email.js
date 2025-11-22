const nodemailer = require("nodemailer");

const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

let transporter = null;

if (isEmailConfigured) {
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587");
  const emailSecure = process.env.EMAIL_SECURE === "true";

  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.error("Email configuration error:", error);
    } else {
      console.log("Email server is ready to send messages");
    }
  });
}

async function sendOTP(email, otp) {
  if (!isEmailConfigured) {
    console.log("\n===========================================");
    console.log("📧 EMAIL VERIFICATION OTP (DEV MODE)");
    console.log("===========================================");
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log("===========================================\n");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "StockFlow IMS - Email Verification OTP",
    text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `
      <div>
        <h2>Email Verification</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordResetOTP(email, otp) {
  if (!isEmailConfigured) {
    console.log("\n===========================================");
    console.log("🔐 PASSWORD RESET OTP (DEV MODE)");
    console.log("===========================================");
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log("===========================================\n");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "StockFlow IMS - Password Reset OTP",
    text: `Your password reset code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `
      <div>
        <h2>Password Reset</h2>
        <p>Your password reset code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTP, sendPasswordResetOTP };

