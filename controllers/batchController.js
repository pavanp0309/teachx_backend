import Batch from "../models/Batch.js";


/* ==============================
  Create a New Batch
 =============================== */
 export const createBatch = async (req, res) => {
  try {
    const { name, startDate, schedule, subject } = req.body; // Destructure subject
    const admin = req.user.id;

    console.log("Request Body:", req.body);
    console.log("Admin ID:", admin);

    const generateBatchCode = (name) => {
      const prefix = name.slice(0, 3).toUpperCase();
      return `${prefix}-${Date.now().toString().slice(-4)}`;
    };

    let batchCode = generateBatchCode(name);
    let existingBatch = await Batch.findOne({ code: batchCode });

    while (existingBatch) {
      console.warn("Duplicate batchCode detected. Regenerating...");
      batchCode = generateBatchCode(name);
      existingBatch = await Batch.findOne({ code: batchCode });
    }

    console.log("Batch to be created:", { name, batchCode, admin, startDate, schedule, subject });

    const batch = new Batch({
      name,
      code: batchCode,
      admin,
      startDate,
      schedule,
      subject, // Add subject to batch creation
    });

    await batch.save();
    res.status(201).json({ message: "Batch created successfully", batch });
  } catch (error) {
    console.error("Error creating batch:", error);

    if (error.code === 11000 && error.keyPattern && error.keyPattern.code) {
      res.status(400).json({ message: "Duplicate batch code detected. Try a different batch name." });
    } else {
      res.status(500).json({ message: "Error creating batch", error: error.message });
    }
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
    const { batchId } = req.params; // Ensure the parameter name matches the route
    const updates = req.body;
    updates.updatedAt = new Date(); // Ensure `updatedAt` is updated

    console.log("Updating batch with ID:", batchId); // Log the batch ID
    console.log("Updated data:", updates); // Log the updated data

    const batch = await Batch.findByIdAndUpdate(batchId, updates, { new: true });

    if (!batch) {
      console.log("Batch not found with ID:", batchId); // Log if batch is not found
      return res.status(404).json({ message: "Batch not found" });
    }

    console.log("Batch updated successfully:", batch); // Log the updated batch
    res.status(200).json({ message: "Batch updated successfully", batch });
  } catch (error) {
    console.error("Error updating batch:", error); // Log the error
    res.status(500).json({ message: "Error updating batch", error: error.message });
  }
};

/** ==============================
 * Enroll Student in a Batch
 * =============================== */
export const enrollStudent = async (req, res) => {
  try {
    const { batchId } = req.body;
    const studentId = req.user.id; // Use authenticated student's ID

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Check if student is already enrolled
    if (batch.students.some((s) => s.student.toString() === studentId)) {
      return res.status(400).json({ message: "Student already enrolled" });
    }

    batch.students.push({ student: studentId, approved: false }); // Awaiting admin approval
    await batch.save();

    res.status(200).json({ message: "Enrollment request sent, awaiting approval", batch });
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
    const { batchId } = req.params;
    console.log("Deleting batch with ID:", batchId); // Log the batch ID

    const deletedBatch = await Batch.findByIdAndDelete(batchId); // Deletes permanently from MongoDB

    if (!deletedBatch) {
      console.log("Batch not found with ID:", batchId); // Log if batch is not found
      return res.status(404).json({ message: "Batch not found" });
    }

    console.log("Batch deleted successfully:", deletedBatch); // Log the deleted batch
    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Error deleting batch:", error); // Log the error
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


export const joinBatchByCode = async (req, res) => {
  try {
    const { batchCode } = req.body; // Ensure batchCode is a string
    const studentId = req.user.id; // Authenticated student's ID

    // Find batch by code
    const batch = await Batch.findOne({ code: batchCode });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Check if student is already enrolled
    if (batch.students.some((s) => s.student.toString() === studentId)) {
      return res.status(400).json({ message: "You are already enrolled in this batch" });
    }

    // Add enrollment request
    batch.enrollmentRequests.push({ student: studentId });
    await batch.save();

    res.status(200).json({ message: "Enrollment request sent successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Error joining batch", error: error.message });
  }
};