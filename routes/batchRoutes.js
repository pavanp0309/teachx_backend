import express from "express";
import { 
  createBatch, getBatches, getBatchById, updateBatch, deleteBatch,
  enrollStudent, removeStudent, assignTrainer, removeTrainer 
} from "../controllers/batchController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

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
router.delete("/:batchId/remove-trainer/:trainerId", protect, authorizeRoles("admin", "superadmin"), removeTrainer);

export default router;
