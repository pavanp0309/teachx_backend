import LiveClass from "../models/LiveClass.js";
import { sendEmailNotification } from "../utils/emailService.js";
import { getZoomAccessToken } from "../config/zoomConfig.js";
import axios from "axios";

//  Handle Zoom Webhooks
export const zoomWebhookHandler = async (req, res) => {
  try {
    const { event, payload } = req.body;
    const meetingId = payload.object.id;
    
    switch (event) {
      case "meeting.started":
        await LiveClass.findOneAndUpdate(
          { meetingId },
          { isLive: true, startedBy: payload.object.host_id }
        );
        break;

      case "meeting.ended":
        await handleMeetingEnded(meetingId, payload.object.duration);
        break;

      case "meeting.participant_joined":
        await handleParticipantJoin(meetingId, payload.object.participant);
        break;

      case "meeting.participant_left":
        await handleParticipantLeave(meetingId, payload.object.participant);
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Zoom Webhook Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle Meeting Ended (Check for 40-Min Limit)
const handleMeetingEnded = async (meetingId, duration) => {
  const liveClass = await LiveClass.findOne({ meetingId });
  if (!liveClass) return;

  // If the meeting lasted exactly 40 minutes, recreate a new session
  if (duration === 40) {
    const zoomToken = await getZoomAccessToken();
    const zoomResponse = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: liveClass.topic,
        type: 2, // Scheduled meeting
        start_time: new Date().toISOString(),
        duration: 60, // Another 60 minutes
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          approval_type: 0,
        },
      },
      {
        headers: { Authorization: `Bearer ${zoomToken}` },
      }
    );

    liveClass.meetingLink = zoomResponse.data.join_url;
    await liveClass.save();

    // Notify attendees about rejoin link
    const attendees = await User.find({ _id: { $in: liveClass.attendees.map(a => a.user) } });
    attendees.forEach(student => {
      sendEmailNotification(student.email, "Live Class Rejoin", 
        `Your live class was interrupted due to Zoom's 40-minute limit. Click here to rejoin: ${liveClass.meetingLink}`
      );
    });
  }

  liveClass.isLive = false;
  await liveClass.save();
};
