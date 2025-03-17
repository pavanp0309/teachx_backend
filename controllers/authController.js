import User from "../models/User.js";
import { sendOTP } from "../utils/mailer.js";
import jwt from "jsonwebtoken";

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
};

// ✅ Send OTP
export const sendOTPToEmail = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    // ✅ Generate OTP & set expiration (5 minutes)
    const otp = generateOTP();
    user.otp = otp.toString();
    user.otpExpires = new Date(Date.now() + 5 * 60000); // 5 min expiry
    await user.save();

    // ✅ Send OTP via email
    await sendOTP(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Verify OTP & Login
export const verifyOTPLogin = async (req, res) => {
  const { email, otp } = req.body;

  try {
    let user = await User.findOne({ email }).select("otp otpExpires name phone isVerified");

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or email not registered" });
    }

    const isOTPExpired = new Date(user.otpExpires).getTime() < Date.now();
    if (isOTPExpired) {
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    // ✅ OTP is valid! Mark user as verified & generate token
    await User.findByIdAndUpdate(user._id, {
      $unset: { otp: 1, otpExpires: 1 },
      isVerified: true,
    });

    const token = generateToken(user._id);

    // ✅ Check if profile is incomplete
    if (!user.name || !user.phone) {
      return res.json({
        message: "Login successful, complete your profile",
        token,
        user,
        profileIncomplete: true
      });
    }

    res.json({ message: "Login successful", token, user });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// ✅ Update Profile
export const updateProfile = async (req, res) => {
  const { name, phone } = req.body; // Get new data from request
  const userId = req.user.id; // Get user ID from JWT

  try {
    // Find user and update details
    const user = await User.findByIdAndUpdate(userId, { name, phone }, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



