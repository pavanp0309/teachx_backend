import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // Convert port to number
  secure: process.env.SMTP_SECURE === "true", // Boolean conversion
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use App Password
  },
  tls: {
    rejectUnauthorized: false, // Prevent SSL issues with some hosts
  },
});

// ✅ Function to Send OTP
export const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"TeachX Support" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "TeachX - Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>TeachX Login OTP</h2>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>This OTP is valid for <strong>${process.env.OTP_EXPIRATION} minutes</strong>. Please do not share this code with anyone.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr />
          <p>Thanks, <br /> TeachX Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};


export const sendEmailNotification = async (to, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📩 Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("Email Error:", error);
  }
};