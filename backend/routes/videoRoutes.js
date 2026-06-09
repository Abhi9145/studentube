const express = require("express");
const router = express.Router();

const {
searchVideos,
saveVideo,
getSavedVideos,
deleteSavedVideo,
addToHistory,
getHistory,
} = require("../controllers/videoController");

const {
protect,
} = require("../middleware/authMiddleware");

router.get("/search", searchVideos);

router.post("/save", protect, saveVideo);
router.get("/saved", protect, getSavedVideos);
router.delete("/saved/:id", protect, deleteSavedVideo);

router.post("/history", protect, addToHistory);
router.get("/history", protect, getHistory);

module.exports = router;
