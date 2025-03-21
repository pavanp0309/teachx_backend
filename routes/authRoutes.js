import express from "express";
import { sendOTPToEmail, verifyOTPLogin, updateProfile,getUserDetails } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOTPToEmail);  
router.post("/verify-otp", verifyOTPLogin); 
router.put("/update-profile", protect, updateProfile); 
router.get("/profile", protect, getUserDetails);


export default router;

