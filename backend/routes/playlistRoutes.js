const express = require("express");

const router = express.Router();

const {
  createPlaylist,
  getPlaylists,
  renamePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
} = require("../controllers/playlistController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/", protect, createPlaylist);

router.get("/", protect, getPlaylists);

router.post(
  "/:playlistId/video",
  protect,
  addVideoToPlaylist
);

router.delete(
  "/:playlistId/video/:videoId",
  protect,
  removeVideoFromPlaylist
);
router.delete(
  "/:playlistId",
  protect,
  deletePlaylist
);
router.put(
  "/:playlistId",
  protect,
  renamePlaylist
);

module.exports = router;