import Batch from "../models/Batch.js";
import User from "../models/User.js";

/** ==============================
 * Create a New Batch
 * =============================== */
export const createBatch = async (req, res) => {
  try {
    const { name, code, startDate, endDate, schedule } = req.body;
    // Ensure the request contains a logged-in user (from JWT authentication)
    const admin = req.user.id; // Extract user ID from req.user

    // Check if batch code is unique
    const existingBatch = await Batch.findOne({ code });
    if (existingBatch) {
      return res.status(400).json({ message: "Batch code must be unique." });
    }

    const batch = new Batch({
      name,
      code,
      admin,
      startDate,
      endDate,
      schedule,
    });

    await batch.save();
    res.status(201).json({ message: "Batch created successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Error creating batch", error: error.message });
  }
};

/** ==============================
 * Get All Batches (with Pagination & Filters)
 * =============================== */
export const getBatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filters = { isDeleted: false };
    if (status) filters.status = status; // Filter by status if provided

    const batches = await Batch.find(filters)
      .populate("admin", "name email")
      .populate("trainers", "name email")
      .populate("students.student", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ startDate: -1 });

    res.status(200).json({ message: "Batches retrieved successfully", batches });
  } catch (error) {
    res.status(500).json({ message: "Error fetching batches", error: error.message });
  }
};

/** ==============================
 * Get Batch By ID (With Population)
 * =============================== */
export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id)
      .populate("admin", "name email")
      .populate("trainers", "name email")
      .populate("students.student", "name email approved joinedAt")
      .populate("liveClasses")
      .populate("assignments")
      .populate("tests");

    if (!batch) return res.status(404).json({ message: "Batch not found" });

    res.status(200).json({ message: "Batch retrieved successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Error fetching batch", error: error.message });
  }
};

/** ==============================
 * Update Batch Details
 * =============================== */
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date(); // Ensure `updatedAt` is updated

    const batch = await Batch.findByIdAndUpdate(id, updates, { new: true });

    if (!batch) return res.status(404).json({ message: "Batch not found" });

    res.status(200).json({ message: "Batch updated successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Error updating batch", error: error.message });
  }
};

/** ==============================
 * Enroll Student in a Batch
 * =============================== */
export const enrollStudent = async (req, res) => {
  try {
    const { batchId, studentId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Check if student is already enrolled
    if (batch.students.some((s) => s.student.toString() === studentId)) {
      return res.status(400).json({ message: "Student already enrolled" });
    }

    batch.students.push({ student: studentId, approved: false });
    await batch.save();

    res.status(200).json({ message: "Student enrolled, awaiting approval", batch });
  } catch (error) {
    res.status(500).json({ message: "Error enrolling student", error: error.message });
  }
};

/** ==============================
 * Assign Trainer to a Batch
 * =============================== */
export const assignTrainer = async (req, res) => {
  try {
    const { batchId, trainerId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    if (batch.trainers.includes(trainerId)) {
      return res.status(400).json({ message: "Trainer already assigned" });
    }

    batch.trainers.push(trainerId);
    await batch.save();

    res.status(200).json({ message: "Trainer assigned successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Error assigning trainer", error: error.message });
  }
};



/** ==============================
 * Remove Student from Batch
 * =============================== */
export const removeStudent = async (req, res) => {
  try {
    const { batchId, studentId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    batch.students = batch.students.filter(
      (s) => s.student.toString() !== studentId
    );
    await batch.save();

    res.status(200).json({ message: "Student removed from batch", batch });
  } catch (error) {
    res.status(500).json({ message: "Error removing student", error: error.message });
  }
};

/** ==============================
 * Soft Delete a Batch
 * =============================== */
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    batch.isDeleted = true;
    await batch.save();

    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting batch", error: error.message });
  }
};

export const requestEnrollment = async (req, res) => {
  try {
    const { batchId } = req.params; // Get batchId from URL
    const studentId = req.user.id; // Get student ID from authenticated user

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Check if student already requested
    if (batch.enrollmentRequests.some((r) => r.student.toString() === studentId)) {
      return res.status(400).json({ message: "Enrollment request already sent" });
    }

    // Add student request
    batch.enrollmentRequests.push({ student: studentId });
    await batch.save();

    res.status(200).json({ message: "Enrollment request sent successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Error requesting enrollment", error: error.message });
  }
};


export const approveOrRejectEnrollment = async (req, res) => {
  try {
    const { batchId, studentId, action } = req.body; // action = "approve" or "reject"

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Find request
    const requestIndex = batch.enrollmentRequests.findIndex((r) => r.student.toString() === studentId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: "Enrollment request not found" });
    }

    if (action === "approve") {
      // Move student from requests to students array
      batch.students.push({ student: studentId, approved: true });
      batch.enrollmentRequests.splice(requestIndex, 1);
    } else if (action === "reject") {
      batch.enrollmentRequests[requestIndex].status = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await batch.save();
    res.status(200).json({ message: `Student ${action}d successfully`, batch });
  } catch (error) {
    res.status(500).json({ message: "Error updating enrollment request", error: error.message });
  }
};
