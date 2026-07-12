const SavedVideo = require("../models/SavedVideo");
const History = require("../models/History");
const axios = require("axios");

// Search YouTube Videos
const searchVideos = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    const lowerQuery = query.toLowerCase();

    const allowedKeywords = [
      "python",
      "java",
      "javascript",
      "react",
      "node",
      "mongodb",
      "mern",
      "html",
      "css",
      "c",
      "c++",
      "programming",
      "coding",
      "tutorial",
      "course",
      "lecture",
      "education",
      "computer",
      "science",
      "math",
      "mathematics",
      "physics",
      "chemistry",
      "biology",
      "history",
      "geography",
      "algorithm",
      "data structure",
      "datastructure",
      "dbms",
      "operating system",
      "os",
      "networking",
      "cybersecurity",
      "machine learning",
      "artificial intelligence",
      "ai",
      "data science",
      "web development",
      "android development",
      "backend",
      "frontend",
      "exam",
      "placement",
      "interview",
      "aptitude"
    ];

    const isEducational = allowedKeywords.some(
      (keyword) => lowerQuery.includes(keyword)
    );

    if (!isEducational) {
      const funnyMessages = [
        "📚 Bro this is Studentube, not YouTube.",
        "🤓 Go search something educational.",
        "🚫 Vlogs are banned. GPA is protected.",
        "🎓 Studentube only serves brain food.",
        "💀 Nice try. Search Python instead.",
        "📖 Study first, entertainment later.",
        "⚡ Educational content only allowed here."
      ];

      return res.json({
        educationalOnly: true,
        message:
          funnyMessages[
            Math.floor(
              Math.random() * funnyMessages.length
            )
          ],
        items: [],
      });
    }

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
    const {
      videoId,
      title,
      thumbnail,
      channel,
    } = req.body;

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
    const {
      videoId,
      title,
      thumbnail,
      channel,
    } = req.body;

    const existingVideo =
      await History.findOne({
        user: req.user._id,
        videoId,
      });

    if (existingVideo) {
      existingVideo.title = title;
      existingVideo.thumbnail =
        thumbnail;
      existingVideo.channel =
        channel;

      existingVideo.updatedAt =
        new Date();

      await existingVideo.save();

      return res.json(existingVideo);
    }

    const history =
      await History.create({
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
    }).sort({
      updatedAt: -1,
    });

    const uniqueHistory = [];
    const seen = new Set();

    for (const video of history) {
      if (!seen.has(video.videoId)) {
        seen.add(video.videoId);
        uniqueHistory.push(video);
      }
    }

    res.json(uniqueHistory);
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