import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const getZoomAccessToken = async () => {
  try {
    const response = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "client_credentials",
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching Zoom access token:", error);
    throw new Error("Failed to get Zoom access token.");
  }
};
