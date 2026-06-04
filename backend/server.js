const express = require("express");
const cors = require("cors");

const app = express();
require("dotenv").config();
const axios = require("axios");
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Studentube API Running");
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected successfully",
  });
});

// Videos route
app.get("/api/videos", (req, res) => {
  res.json([
    {
      id: 1,
      title: "Python Tutorial for Beginners",
      channel: "Programming with Mosh",
      thumbnail: "https://picsum.photos/300/180?1",
    },
    {
      id: 2,
      title: "JavaScript Full Course",
      channel: "freeCodeCamp",
      thumbnail: "https://picsum.photos/300/180?2",
    },
    {
      id: 3,
      title: "React Crash Course",
      channel: "Traversy Media",
      thumbnail: "https://picsum.photos/300/180?3",
    },
  ]);
});

const PORT = 8000;
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 12,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    res.json(response.data.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching videos",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});