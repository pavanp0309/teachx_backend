import express from "express";
import { sendOTPToEmail, verifyOTPLogin, updateProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOTPToEmail);  // ✅ Should exist
router.post("/verify-otp", verifyOTPLogin);  // ✅ Should exist
router.post("/update-profile", protect, updateProfile); // ✅ Should exist


export default router;

