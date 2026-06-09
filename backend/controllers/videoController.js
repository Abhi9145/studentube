const SavedVideo = require("../models/SavedVideo");
const History = require("../models/History");
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
    const { videoId, title, thumbnail, channel } = req.body;

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

// Delete Saved Video
const deleteSavedVideo = async (req, res) => {
  try {
    const video = await SavedVideo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    await video.deleteOne();

    res.json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Video To History
const addToHistory = async (req, res) => {
  try {
    const { videoId, title, thumbnail, channel } = req.body;

    const history = await History.create({
      user: req.user._id,
      videoId,
      title,
      thumbnail,
      channel,
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Watch History
const getHistory = async (req, res) => {
  try {
    const history = await History.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(history);
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
  deleteSavedVideo,
  addToHistory,
  getHistory,
};