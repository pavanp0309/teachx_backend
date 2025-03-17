import axios from "axios";
import LiveClass from "../models/LiveClass.js";
import Batch from "../models/Batch.js";
import User from "../models/User.js";
import { getZoomAccessToken } from "../config/zoomConfig.js";

// 📌 Create a Live Class (Admin / Trainer)
export const createLiveClass = async (req, res) => {
  try {
    const { batch, trainer, topic, date, startTime, endTime } = req.body;

    const batchExists = await Batch.findById(batch);
    if (!batchExists) return res.status(404).json({ message: "Batch not found." });

    const trainerExists = await User.findById(trainer);
    if (!trainerExists) return res.status(404).json({ message: "Trainer not found." });

    // 🔹 Generate Zoom Meeting
    const zoomToken = await getZoomAccessToken();
    const zoomResponse = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic,
        type: 2, // Scheduled meeting
        start_time: new Date(startTime).toISOString(),
        duration: Math.floor((new Date(endTime) - new Date(startTime)) / 60000),
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          approval_type: 0, // No registration required
        },
      },
      {
        headers: { Authorization: `Bearer ${zoomToken}` },
      }
    );

    const liveClass = await LiveClass.create({
      batch,
      trainer,
      topic,
      date,
      startTime,
      endTime,
      meetingLink: zoomResponse.data.join_url, // Zoom Meeting Link
    });

    res.status(201).json({ success: true, data: liveClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get All Live Classes (Filter by Batch)
export const getLiveClasses = async (req, res) => {
  try {
    const { batchId } = req.query;
    const filter = batchId ? { batch: batchId } : {};

    const liveClasses = await LiveClass.find(filter).populate("trainer", "name email");

    res.status(200).json({ success: true, data: liveClasses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { liveClassId, studentId } = req.body;

    const liveClass = await LiveClass.findById(liveClassId);
    if (!liveClass) return res.status(404).json({ message: "Live Class not found." });

    if (!liveClass.attendees.some(attendee => attendee.user.toString() === studentId)) {
      liveClass.attendees.push({ user: studentId });
      await liveClass.save();
    }

    res.status(200).json({ success: true, message: "Attendance marked successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Attach Recording
export const attachRecording = async (req, res) => {
  try {
    const { liveClassId } = req.params;
    const { recordingUrl } = req.body;

    const liveClass = await LiveClass.findById(liveClassId);
    if (!liveClass) return res.status(404).json({ message: "Live Class not found." });

    liveClass.recording = { url: recordingUrl, availableAt: new Date() };
    await liveClass.save();

    res.status(200).json({ success: true, message: "Recording attached successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
