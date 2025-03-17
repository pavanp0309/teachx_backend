import express from "express";
import {
  createLiveClass,
  getLiveClasses,
  markAttendance,
  attachRecording,
} from "../controllers/liveClassController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "trainer"), createLiveClass);
router.get("/", protect, getLiveClasses);
router.post("/attendance", protect, authorizeRoles("student"), markAttendance);
router.post("/:liveClassId/recording", protect, authorizeRoles("admin", "trainer"), attachRecording);

export default router;
