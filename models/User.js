import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },

    otp: { type: String, select: false }, // Hide OTP
    otpExpires: { type: Date },

    role: {
      type: String,
      enum: ["superadmin", "admin", "trainer", "student"],
      default: "student",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
