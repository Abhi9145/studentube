const SavedVideo = require("../models/SavedVideo");
const axios = require("axios");

// Search YouTube Videos
const searchVideos = async (req, res) => {
  try {
    const query = req.query.q || "python";

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          maxResults: 20,
          q: query,
          type: "video",
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    res.json(response.data.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch videos",
    });
  }
};

// Save Video
const saveVideo = async (req, res) => {
  try {
    const { videoId, title, thumbnail, channel } =
      req.body;

    const video = await SavedVideo.create({
      user: req.user._id,
      videoId,
      title,
      thumbnail,
      channel,
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Saved Videos
const getSavedVideos = async (req, res) => {
  try {
    const videos = await SavedVideo.find({
      user: req.user._id,
    });

    res.json(videos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  searchVideos,
  saveVideo,
  getSavedVideos,
};