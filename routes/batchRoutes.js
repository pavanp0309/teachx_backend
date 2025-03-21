import express from "express";
import { 
  createBatch, getBatches, getBatchById, updateBatch, deleteBatch,
  enrollStudent, removeStudent, assignTrainer,requestEnrollment, approveOrRejectEnrollment
} from "../controllers/batchController.js";

import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Create a New Batch (Only Admin/SuperAdmin)
router.post("/", protect, authorizeRoles("admin", "superadmin"), createBatch);

// ✅ Get All Batches (Accessible to All Authenticated Users)
router.get("/", protect, getBatches);

// ✅ Get Single Batch Details (Accessible to All Authenticated Users)
router.get("/:batchId", protect, getBatchById);

// ✅ Update Batch Details (Only Admin/SuperAdmin)
router.put("/:batchId", protect, authorizeRoles("admin", "superadmin"), updateBatch);

// ✅ Delete Batch (Only Admin/SuperAdmin)
router.delete("/:batchId", protect, authorizeRoles("admin", "superadmin"), deleteBatch);

// ✅ Enroll Student in Batch (Only Admin/SuperAdmin)
router.put("/:batchId/enroll", protect, authorizeRoles("admin", "superadmin"), enrollStudent);

// ✅ Remove Student from Batch (Only Admin/SuperAdmin)
router.delete("/:batchId/remove-student/:studentId", protect, authorizeRoles("admin", "superadmin"), removeStudent);

// ✅ Assign Trainer to Batch (Only Admin/SuperAdmin)
router.put("/:batchId/assign-trainer", protect, authorizeRoles("admin", "superadmin"), assignTrainer);

// ✅ Remove Trainer from Batch (Only Admin/SuperAdmin)
// router.delete("/:batchId/remove-trainer/:trainerId", protect, authorizeRoles("admin", "superadmin"), removeTrainer);

// Student requests enrollment
router.post("/:batchId/request-enrollment", protect, requestEnrollment);

// Admin approves or rejects requests
router.put("/approve-or-reject", protect, approveOrRejectEnrollment);


export default router;
