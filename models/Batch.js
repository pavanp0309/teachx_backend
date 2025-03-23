import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Limit batch name length
    },
    subject: {
      type: String, // or create a separate Subject schema if needed
      required: true,
      trim: true,
      maxlength: 100,
    },

    code: {
      type: String,
      unique: true,
      required: true,
      immutable: true,
      uppercase: true,
      trim: true,
      default:  function () {
        return `${this.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      }, // Generate // Prevents `null` value
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster querying
    },

    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true, // Optimize queries involving trainers
      },
    ],

    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true, // Optimizing student-based queries
        },
        approved: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    startDate: {
      type: Date,
      required: true,
      index: true, // Queries based on batch start date
    },



    schedule: {
      type: String,
      default: "TBD",
      trim: true,
      maxlength: 200, // Prevent overly long schedules
    },

    liveClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveClass",
      },
    ],

    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],

    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
      },
    ],

    attendance: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
      },
    ],

    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    enrollmentRequests: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Completed", "Archived"],
      default: "Active",
      index: true, // Optimize filtering by status
    },

    isDeleted: {
      type: Boolean,
      default: false, // Soft delete mechanism
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Pre-save Hook to Update `updatedAt` Automatically
// ✅ Automatically update `updatedAt` field before save
BatchSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// ✅ Indexing for Faster Queries
BatchSchema.index({ startDate: 1, status: 1 });
BatchSchema.index({ students: 1 });

// ✅ Soft Delete Support
BatchSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  await this.save();
};

const Batch = mongoose.models.Batch || mongoose.model("Batch", BatchSchema);
export default Batch;
