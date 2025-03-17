import mongoose from "mongoose";

const LiveClassSchema = new mongoose.Schema(
  {
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    topic: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    meetingLink: { type: String, trim: true, default: "" }, // Zoom Meeting Link

    recording: {
      url: { type: String, trim: true },
      availableAt: { type: Date }, // Timestamp when recording is available
    },

    attendees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date },
      },
    ],

    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who started the class
    isLive: { type: Boolean, default: false }, // Status of the class

  },
  { timestamps: true }
);

const LiveClass = mongoose.models.LiveClass || mongoose.model("LiveClass", LiveClassSchema);
export default LiveClass;
