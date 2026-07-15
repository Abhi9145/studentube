const SavedVideo = require("../models/SavedVideo");
const History = require("../models/History");
const SearchCache = require("../models/SearchCache");
const axios = require("axios");

// High-quality fallback educational videos to serve when YouTube API quota is exceeded or offline
const FALLBACK_VIDEOS = [
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "rfscVS0vtbw" },
    snippet: {
      title: "Python for Beginners – Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/rfscVS0vtbw/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "PkZNo7MFNFg" },
    snippet: {
      title: "Learn JavaScript – Full Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/PkZNo7MFNFg/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "zOjov-2OZ0E" },
    snippet: {
      title: "HTML Full Course – Build a Website Tutorial",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/zOjov-2OZ0E/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "OXGznpKZ_sA" },
    snippet: {
      title: "CSS Tutorial – Zero to Hero (Complete Course)",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/OXGznpKZ_sA/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "bMknfKXIFA8" },
    snippet: {
      title: "React JS Full Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/bMknfKXIFA8/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "RGOj5yH7evk" },
    snippet: {
      title: "Git and GitHub for Beginners - Crash Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/RGOj5yH7evk/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "ua-CiDNNj30" },
    snippet: {
      title: "Machine Learning for Everybody – Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/ua-CiDNNj30/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "l9AzO1FMgM8" },
    snippet: {
      title: "Data Structures Easy to Advanced – Full Tutorial",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/l9AzO1FMgM8/mqdefault.jpg" }
      }
    }
  }
];

const getFallbackVideos = (query) => {
  const lowerQuery = query.toLowerCase();
  const matched = FALLBACK_VIDEOS.filter(video => {
    const title = video.snippet.title.toLowerCase();
    const channel = video.snippet.channelTitle.toLowerCase();
    return title.includes(lowerQuery) || channel.includes(lowerQuery);
  });
  return matched.length > 0 ? matched : FALLBACK_VIDEOS;
};

// Search YouTube Videos
const searchVideos = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    const lowerQuery = query.toLowerCase();

    const allowedKeywords = [
      "python",
      "java",
      "javascript",
      "react",
      "node",
      "mongodb",
      "mern",
      "html",
      "css",
      "c",
      "c++",
      "programming",
      "coding",
      "tutorial",
      "course",
      "lecture",
      "education",
      "computer",
      "science",
      "math",
      "mathematics",
      "physics",
      "chemistry",
      "biology",
      "history",
      "geography",
      "algorithm",
      "data structure",
      "datastructure",
      "dbms",
      "operating system",
      "os",
      "networking",
      "cybersecurity",
      "machine learning",
      "artificial intelligence",
      "ai",
      "data science",
      "web development",
      "android development",
      "backend",
      "frontend",
      "exam",
      "placement",
      "interview",
      "aptitude"
    ];

    const isEducational = allowedKeywords.some(
      (keyword) => lowerQuery.includes(keyword)
    );

    if (!isEducational) {
      const funnyMessages = [
        "📚 Bro this is Studentube, not YouTube.",
        "🤓 Go search something educational.",
        "🚫 Vlogs are banned. GPA is protected.",
        "🎓 Studentube only serves brain food.",
        "💀 Nice try. Search Python instead.",
        "📖 Study first, entertainment later.",
        "⚡ Educational content only allowed here."
      ];

      return res.json({
        educationalOnly: true,
        message:
          funnyMessages[
            Math.floor(
              Math.random() * funnyMessages.length
            )
          ],
        items: [],
      });
    }

    // 1. Check MongoDB Cache first
    try {
      const cached = await SearchCache.findOne({ query: lowerQuery });
      if (cached && Array.isArray(cached.results) && cached.results.length > 0) {
        console.log(`[Cache Hit] Serving search results for: "${query}"`);
        return res.json(cached.results);
      }
    } catch (cacheErr) {
      console.error("Cache read error:", cacheErr);
    }

    // 2. Fetch from YouTube API if not cached
    try {
      console.log(`[API Request] Querying YouTube API for: "${query}"`);
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            maxResults: 20,
            q: query,
            type: "video",
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      const items = response.data.items || [];

      // Save to cache asynchronously (do not block client response)
      if (items.length > 0) {
        SearchCache.create({
          query: lowerQuery,
          results: items
        }).catch(cacheErr => console.error("Cache write error:", cacheErr));
      }

      return res.json(items);

    } catch (apiError) {
      console.error(`YouTube API error for query "${query}":`, apiError.message);
      
      // Serve fallback videos structured exactly like YouTube API results
      const fallbacks = getFallbackVideos(query);
      console.log(`[Fallback] Serving static educational fallback videos for: "${query}"`);
      return res.json(fallbacks);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch videos",
    });
  }
};
// Save Video
const saveVideo = async (req, res) => {
  try {
    const {
      videoId,
      title,
      thumbnail,
      channel,
    } = req.body;

    const video = await SavedVideo.create({
      user: req.user._id,
      videoId,
      title,
      thumbnail,
      channel,
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Saved Videos
const getSavedVideos = async (req, res) => {
  try {
    const videos = await SavedVideo.find({
      user: req.user._id,
    });

    res.json(videos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Saved Video
const deleteSavedVideo = async (req, res) => {
  try {
    const video = await SavedVideo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    await video.deleteOne();

    res.json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Video To History
const addToHistory = async (req, res) => {
  try {
    const {
      videoId,
      title,
      thumbnail,
      channel,
      watchedSeconds,
    } = req.body;

    const existingVideo = await History.findOne({
      user: req.user._id,
      videoId,
    });

    if (existingVideo) {
      existingVideo.title = title;
      existingVideo.thumbnail = thumbnail;
      existingVideo.channel = channel;
      if (watchedSeconds !== undefined) {
        existingVideo.watchedSeconds = watchedSeconds;
      }
      existingVideo.updatedAt = new Date();
      await existingVideo.save();
      return res.json(existingVideo);
    }

    const history = await History.create({
      user: req.user._id,
      videoId,
      title,
      thumbnail,
      channel,
      watchedSeconds: watchedSeconds || 0,
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Watch History
const getHistory = async (req, res) => {
  try {
    const history = await History.find({
      user: req.user._id,
    }).sort({
      updatedAt: -1,
    });

    const uniqueHistory = [];
    const seen = new Set();

    for (const video of history) {
      if (!seen.has(video.videoId)) {
        seen.add(video.videoId);
        uniqueHistory.push(video);
      }
    }

    res.json(uniqueHistory);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Video Details (including description and channel information)
const getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,contentDetails,statistics",
          id: videoId,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const item = response.data.items[0];
    const snippet = item.snippet;

    res.json({
      videoId: item.id,
      title: snippet.title,
      description: snippet.description,
      channel: snippet.channelTitle,
      channelId: snippet.channelId,
      publishedAt: snippet.publishedAt,
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
    });
  } catch (error) {
    console.error("Get video details error:", error);
    res.status(500).json({
      message: "Failed to fetch video details",
    });
  }
};

module.exports = {
  searchVideos,
  saveVideo,
  getSavedVideos,
  deleteSavedVideo,
  addToHistory,
  getHistory,
  getVideoDetails,
};