import express from "express";
import {
  getAllUsers,
  promoteUser,
  assignRole,
  removeUser
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/users", protect, authorizeRoles("admin", "superadmin"), getAllUsers);
router.put("/promote/:id", protect, authorizeRoles("admin", "superadmin"), promoteUser);
router.patch("/assign-role/:id", protect, authorizeRoles("superadmin"), assignRole);
router.delete("/remove/:id", protect, authorizeRoles("admin", "superadmin"), removeUser);

export default router;
