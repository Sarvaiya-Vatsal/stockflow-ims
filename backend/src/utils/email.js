const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
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
  const mailOptions = {
    from: process.env.EMAIL_FROM,
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

