const Playlist = require("../models/Playlist");

// Create Playlist
const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;

    const playlist = await Playlist.create({
      user: req.user._id,
      name,
      videos: [],
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Playlists
const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({
      user: req.user._id,
    });

    res.json(playlists);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Video To Playlist
const addVideoToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const {
      videoId,
      title,
      thumbnail,
      channel,
    } = req.body;

    const playlist =
      await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }

    if (
      playlist.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const alreadyExists =
      playlist.videos.find(
        (video) =>
          video.videoId === videoId
      );

    if (alreadyExists) {
      return res.status(400).json({
        message:
          "Video already exists in playlist",
      });
    }

    playlist.videos.push({
      videoId,
      title,
      thumbnail,
      channel,
    });

    await playlist.save();

    res.json({
      message:
        "Video added successfully",
      playlist,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Remove Video From Playlist
const removeVideoFromPlaylist =
  async (req, res) => {
    try {
      const {
        playlistId,
        videoId,
      } = req.params;

      const playlist =
        await Playlist.findById(
          playlistId
        );

      if (!playlist) {
        return res.status(404).json({
          message:
            "Playlist not found",
        });
      }

      playlist.videos =
        playlist.videos.filter(
          (video) =>
            video.videoId !== videoId
        );

      await playlist.save();

      res.json({
        message:
          "Video removed successfully",
        playlist,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };
  const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(
      playlistId
    );

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }

    if (
      playlist.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await playlist.deleteOne();

    res.json({
      message:
        "Playlist deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
  console.log("DELETE PLAYLIST HIT");
console.log(req.params);
};
const renamePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name } = req.body;

    const playlist =
      await Playlist.findById(
        playlistId
      );

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }

    if (
      playlist.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    playlist.name = name;

    await playlist.save();

    res.json({
      message:
        "Playlist renamed successfully",
      playlist,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createPlaylist,
  getPlaylists,
  addVideoToPlaylist,
  renamePlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
};