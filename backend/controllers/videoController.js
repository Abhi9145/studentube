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
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "vLqTf2b6GZw" },
    snippet: {
      title: "C++ Tutorial for Beginners - Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/vLqTf2b6GZw/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "HXV3zeQKqGY" },
    snippet: {
      title: "SQL Tutorial - Full Database Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/HXV3zeQKqGY/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "grEKMHGYyns" },
    snippet: {
      title: "Java Tutorial for Beginners [Full Course]",
      channelTitle: "Programming with Mosh",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/grEKMHGYyns/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "TlB_eWDSMt4" },
    snippet: {
      title: "Node.js & Express.js - Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/TlB_eWDSMt4/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "30PJ0rFeF9U" },
    snippet: {
      title: "Introduction to Physics - Science Crash Course",
      channelTitle: "CrashCourse",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/30PJ0rFeF9U/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "fNk_zzaMoEs" },
    snippet: {
      title: "Calculus 1 - Full College Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/fNk_zzaMoEs/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "pTbSfLHWyDY" },
    snippet: {
      title: "Docker for Beginners - Full Crash Course",
      channelTitle: "TechWorld with Nana",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/pTbSfLHWyDY/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "qwAFL1597OU" },
    snippet: {
      title: "Cybersecurity Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/qwAFL1597OU/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "sZypP4H9vFY" },
    snippet: {
      title: "Linux Command Line Tutorial for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/sZypP4H9vFY/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "X3paOmcrTjQ" },
    snippet: {
      title: "Introduction to Computer Science and Programming",
      channelTitle: "MIT OpenCourseWare",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/X3paOmcrTjQ/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "LHBEIOLrQUM" },
    snippet: {
      title: "Python for Data Science - Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/LHBEIOLrQUM/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "y8k5cM9_D_I" },
    snippet: {
      title: "Linear Algebra - College Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/y8k5cM9_D_I/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "V9_vXhA2y64" },
    snippet: {
      title: "Next.js 14 Tutorial for Beginners - React Framework",
      channelTitle: "Codevolution",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/V9_vXhA2y64/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "t2oSFd5MN28" },
    snippet: {
      title: "Data Science for Beginners - Full Crash Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/t2oSFd5MN28/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "O5nskjZ_GoI" },
    snippet: {
      title: "UX/UI Design Tutorial for Beginners",
      channelTitle: "DesignCourse",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/O5nskjZ_GoI/mqdefault.jpg" }
      }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "kGtEAXsHk24" },
    snippet: {
      title: "Excel Tutorial for Beginners - Learn in 20 Mins",
      channelTitle: "Kevin Stratvert",
      thumbnails: {
        high: { url: "https://i.ytimg.com/vi/kGtEAXsHk24/mqdefault.jpg" }
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
            maxResults: 36,
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