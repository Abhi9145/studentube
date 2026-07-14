const mongoose = require("mongoose");

const searchCacheSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  results: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL 24 hours
});

module.exports = mongoose.model("SearchCache", searchCacheSchema);
