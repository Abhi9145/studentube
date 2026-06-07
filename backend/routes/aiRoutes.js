const express = require("express");
const router = express.Router();

const {
  generateNotes,
} = require("../controllers/aiController");

router.post("/notes", generateNotes);

module.exports = router;