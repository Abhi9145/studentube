const express = require("express");

const router = express.Router();

const {
  getUserStats,
} = require("../controllers/userController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.get("/stats", protect, getUserStats);

module.exports = router;