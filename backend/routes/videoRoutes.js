const express = require("express");
const router = express.Router();

const {
  searchVideos,
  saveVideo,
  getSavedVideos,
} = require("../controllers/videoController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.get("/search", searchVideos);

router.post("/save", protect, saveVideo);

router.get("/saved", protect, getSavedVideos);

module.exports = router;