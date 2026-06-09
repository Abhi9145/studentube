const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    videoId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    channel: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("History", historySchema);