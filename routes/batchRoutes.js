import express from "express";
import { 
  createBatch, getBatches, getBatchById, updateBatch, deleteBatch,
  enrollStudent, removeStudent, assignTrainer, requestEnrollment, approveOrRejectEnrollment , joinBatchByCode
} from "../controllers/batchController.js";

import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ===================== Batch CRUD Routes =====================
router.post("/", protect, authorizeRoles("admin", "superadmin"), createBatch); // Create Batch
router.get("/", protect, getBatches); // Get All Batches
router.get("/:batchId", protect, getBatchById); // Get Single Batch
router.put("/:batchId", protect, authorizeRoles("admin", "superadmin"), updateBatch); // Update Batch
router.delete("/:batchId", protect, authorizeRoles("admin", "superadmin"), deleteBatch); // Soft Delete Batch

// ===================== Enrollment & Trainer Routes =====================
router.post("/:batchId/enroll", protect, authorizeRoles("admin", "superadmin"), enrollStudent); // Enroll Student
router.delete("/:batchId/remove-student/:studentId", protect, authorizeRoles("admin", "superadmin"), removeStudent); // Remove Student
router.post("/:batchId/assign-trainer", protect, authorizeRoles("admin", "superadmin"), assignTrainer); // Assign Trainer
// Future Implementation: Remove Trainer
// router.delete("/:batchId/remove-trainer/:trainerId", protect, authorizeRoles("admin", "superadmin"), removeTrainer);

// ===================== Enrollment Request Routes =====================
router.post("/:batchId/request-enrollment", protect, requestEnrollment); // Student Enrollment Request
router.put("/:batchId/approve-or-reject", protect, authorizeRoles("admin", "superadmin"), approveOrRejectEnrollment); // Admin Approval/Rejection
router.post("/join-by-code", protect, authorizeRoles("student"), joinBatchByCode);

export default router;
