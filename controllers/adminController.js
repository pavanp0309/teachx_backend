import User from "../models/User.js";
// import logger from "../utils/logger.js"; // ✅ Logs admin actions for audits

const roleHierarchy = {
  superadmin: ["student", "trainer", "admin"],  // Correct Order ✅
  admin: ["student", "trainer"], // Admin can promote student → trainer
  trainer: ["student"], // Trainer can promote student (if needed)
};


// ✅ Get All Users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// ✅ Promote a User (Only Within Allowed Hierarchy)
export const promoteUser = async (req, res, next) => {
  try {
    const admin = req.user;  // Logged-in admin making the request
    const user = await User.findById(req.params.id);
    
    console.log("Admin Role:", admin.role);
    console.log("User Role Before Promotion:", user.role);
    console.log("Role Hierarchy for Admin:", roleHierarchy[admin.role]);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!roleHierarchy[admin.role]?.includes(user.role)) {
      return res.status(403).json({ message: "You cannot promote this user." });
    }

    const nextRoleIndex = roleHierarchy[admin.role].indexOf(user.role) + 1;
    console.log("Next Role Index:", nextRoleIndex);

    if (nextRoleIndex >= roleHierarchy[admin.role].length) {
      return res.status(400).json({ message: "User is already at the highest role you can assign." });
    }

    user.role = roleHierarchy[admin.role][nextRoleIndex];
    await user.save();

    console.log(`${admin.email} promoted ${user.email} to ${user.role}`); 

    res.status(200).json({ message: `User promoted to ${user.role}`, user });
  } catch (error) {
    next(error);
  }
};

// ✅ Assign Role Securely (Super Admin Only)
export const assignRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!roleHierarchy.superadmin.includes(role)) {
      return res.status(400).json({ message: "Invalid role assignment" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only Super Admin can assign roles." });
    }

    user.role = role;
    await user.save();

    // logger.info(`${req.user.email} assigned ${user.email} to ${role}`); // ✅ Log Action

    res.status(200).json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    next(error);
  }
};

// ✅ Remove User (Only Allowed Hierarchy)
export const removeUser = async (req, res, next) => {
  try {
    const admin = req.user;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Prevent Super Admin from being deleted
    if (user.role === "superadmin") {
      return res.status(403).json({ message: "Super Admin cannot be deleted." });
    }

    // ✅ Ensure admin can only remove users below their hierarchy
    if (!roleHierarchy[admin.role]?.includes(user.role)) {
      return res.status(403).json({ message: "You cannot remove this user." });
    }

    await User.findByIdAndDelete(req.params.id);

    // logger.warn(`${admin.email} removed ${user.email} (Role: ${user.role})`); // ✅ Log Deletion Action

    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    next(error);
  }
};
