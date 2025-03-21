import User from "../models/User.js";
import { sendOTP } from "../utils/mailer.js";
import jwt from "jsonwebtoken";

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
};

// Send OTP
export const sendOTPToEmail = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email,phone: null });
    }

    // Generate OTP & set expiration (5 minutes)
    const otp = generateOTP();
    user.otp = otp.toString();
    user.otpExpires = new Date(Date.now() + 5 * 60000); // 5 min expiry
    await user.save();

    // Send OTP via email
    await sendOTP(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify OTP & Login
export const verifyOTPLogin = async (req, res) => {
  console.log("Received request body:", req.body);
  const { email, otp } = req.body;

  try {
    let user = await User.findOne({ email }).select("email otp otpExpires name isVerified role");// Includes all

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or email not registered" });
    }

    console.log("User found in DB:", user); //  Debug user data
    const isOTPExpired = new Date(user.otpExpires).getTime() < Date.now();
    if (isOTPExpired) {
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    // OTP is valid! Mark user as verified & generate token
    await User.findByIdAndUpdate(user._id, {
      $unset: { otp: 1, otpExpires: 1 },
      isVerified: true,
    });

    const token = generateToken(user); // Pass entire user object

    // Check if profile is incomplete
    if (!user.name || !user.phone) {
      return res.json({
        message: "Login successful, complete your profile",
        token,
        user: {
          _id: user._id,
          email,
          name: user.name,
          phone: user.phone,
          role: user.role, // Ensure role is returned
          isVerified: user.isVerified
        },
        profileIncomplete: true
      });
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role, 
        isVerified: user.isVerified
      }
    });

    console.log("Response User Data:", {
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role, 
      isVerified: user.isVerified,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Update Profile
export const updateProfile = async (req, res) => {
  const { name, phone } = req.body; // Get new data from request
  const userId = req.user.id; // Get user ID from JWT
 
  try {
    const updateData = { name };
    if (phone) updateData.phone = phone; 
    // Find user and update details
    const user = await User.findByIdAndUpdate(userId, { name, phone }, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get User Details
export const getUserDetails = async (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT

  try {
    const user = await User.findById(userId).select("-otp -otpExpires"); // Exclude OTP fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User details fetched successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


