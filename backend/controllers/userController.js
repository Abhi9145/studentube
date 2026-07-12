const Playlist = require("../models/Playlist");
const SavedVideo = require("../models/SavedVideo");
const History = require("../models/History");

const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const playlists = await Playlist.countDocuments({
      user: userId,
    });

    const savedVideos =
      await SavedVideo.countDocuments({
        user: userId,
      });

    const history =
      await History.countDocuments({
        user: userId,
      });

    res.json({
      playlists,
      savedVideos,
      history,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getUserStats,
};