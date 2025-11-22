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
    console.log("===========================================");
    console.log("⚠️  Email not configured. Add EMAIL_USER and EMAIL_PASS to .env");
    console.log("===========================================\n");
    return;
  }

  if (!transporter) {
    throw new Error("Email transporter not initialized. Check your email configuration.");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "StockFlow IMS - Email Verification OTP",
    text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 4px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      to: email,
      subject: mailOptions.subject,
    });
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", {
      error: error.message,
      code: error.code,
      command: error.command,
      to: email,
    });
    throw error;
  }
}

async function sendPasswordResetOTP(email, otp) {
  if (!isEmailConfigured) {
    console.log("\n===========================================");
    console.log("🔐 PASSWORD RESET OTP (DEV MODE)");
    console.log("===========================================");
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log("===========================================");
    console.log("⚠️  Email not configured. Add EMAIL_USER and EMAIL_PASS to .env");
    console.log("===========================================\n");
    return;
  }

  if (!transporter) {
    throw new Error("Email transporter not initialized. Check your email configuration.");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "StockFlow IMS - Password Reset OTP",
    text: `Your password reset code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset</h2>
        <p>Your password reset code is:</p>
        <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 4px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully:", {
      messageId: info.messageId,
      to: email,
      subject: mailOptions.subject,
    });
    return info;
  } catch (error) {
    console.error("❌ Password reset email sending failed:", {
      error: error.message,
      code: error.code,
      command: error.command,
      to: email,
    });
    throw error;
  }
}

module.exports = { sendOTP, sendPasswordResetOTP };

