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

const BANNED_PATTERNS = [
  /\breaction(s)?\b/i,
  /\breacting\b/i,
  /\breact to\b/i,
  /\bmusic video\b/i,
  /\bofficial (music )?video\b/i,
  /\bofficial audio\b/i,
  /\blyric(s)? video\b/i,
  /\bsong(s)?\b/i,
  /\bcover(s)?\b/i,
  /\blive performance\b/i,
  /\bvisualizer\b/i,
  /\bkaraoke\b/i,
  /\balbum\b/i,
  /\bsoundtrack\b/i,
  /\bvevo\b/i,
  /\bmix\b/i,
  /\bplaylist\b/i,
  /\bchoreography\b/i,
  /\bdance\b/i,
  /\bsnapchat\b/i,
  /\btiktok\b/i,
  /\bshorts\b/i,
  /\bfunny moments\b/i,
  /\bcompilation\b/i,
  /\bprank(s)?\b/i,
  /\bgaming\b/i,
  /\bgameplay\b/i,
  /\btrailer\b/i
];

const isWordMatch = (query, keyword) => {
  let startIdx = 0;
  while ((startIdx = query.indexOf(keyword, startIdx)) !== -1) {
    const charBefore = startIdx > 0 ? query[startIdx - 1] : null;
    const charAfter = startIdx + keyword.length < query.length ? query[startIdx + keyword.length] : null;

    const isBeforeValid = !charBefore || !/^[a-zA-Z0-9]$/.test(charBefore);
    const isAfterValid = !charAfter || !/^[a-zA-Z0-9]$/.test(charAfter);

    if (isBeforeValid && isAfterValid) {
      return true;
    }
    startIdx += 1;
  }
  return false;
};

const getRefinedQuery = (query) => {
  const lower = query.trim().toLowerCase();
  if (lower === "react" || lower === "reactjs") {
    return "react js tutorial";
  }
  if (lower === "c") {
    return "c programming tutorial";
  }
  if (lower === "c++") {
    return "c++ programming tutorial";
  }
  if (lower === "java") {
    return "java programming tutorial";
  }
  if (lower === "python") {
    return "python programming tutorial";
  }
  if (lower === "os") {
    return "operating system tutorial";
  }
  if (lower === "ai") {
    return "artificial intelligence tutorial";
  }
  if (lower === "dbms") {
    return "dbms course";
  }

  // Broad searches containing "react" but missing educational keywords
  if (lower.includes("react") && !/\b(js|native|tutorial|course|programming|coding|web|development|developer|lecture|learn|education)\b/.test(lower)) {
    return query + " js programming tutorial";
  }

  return query;
};

const isEducationalVideo = (video) => {
  const title = (video.snippet?.title || "").toLowerCase();
  const channel = (video.snippet?.channelTitle || "").toLowerCase();

  // Block general music/songs/playlists, but allow if it's a coding tutorial/app/player
  const hasMusic = /\b(music|musics|song|songs|playlist|melody|audio|track|tracklist|album|mix|ambient|lofi|instrumental|singing|sing|band|rap|dance|beat|beats)\b/i.test(title) ||
                    /\b(music|musics|song|songs|playlist|melody|audio|track|tracklist|album|mix|ambient|lofi|instrumental|singing|sing|band|rap|dance|beat|beats)\b/i.test(channel);

  // Block general cricket/sports videos, but allow if it's a coding tutorial/app
  const hasCricket = /\b(cricket|crickets|cricketer|cricketers|ipl|t20|odi|bcci|batsman|batsmen|bowler|bowlers|wicket|wickets|dhoni|kohli|sachin|scoreboard|match highlights)\b/i.test(title) ||
                     /\b(cricket|crickets|cricketer|cricketers|ipl|t20|odi|bcci|batsman|batsmen|bowler|bowlers|wicket|wickets|dhoni|kohli|sachin)\b/i.test(channel);

  const isCodingRelated = /\b(player|app|clone|api|database|system|website|compiler|parser|interpreter|framework|library)\b/i.test(title);

  if ((hasMusic || hasCricket) && !isCodingRelated) {
    return false;
  }

  const hasBannedPattern = BANNED_PATTERNS.some(pattern => 
    pattern.test(title) || pattern.test(channel)
  );

  return !hasBannedPattern;
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

    let isEducational = allowedKeywords.some(
      (keyword) => isWordMatch(lowerQuery, keyword)
    );

    // Music & Cricket blocker: If query contains music/cricket words but not programming/development project keywords, block it.
    const containsBannedTerm = /\b(music|musics|song|songs|singing|instrumental|lofi|ambient|playlist|band|rap|dance|beat|beats|cricket|crickets|cricketer|cricketers|ipl|t20|odi|bcci|batsman|batsmen|bowler|bowlers|wicket|wickets|dhoni|kohli|sachin)\b/i.test(lowerQuery);
    const isCodingRelated = /\b(player|app|clone|api|database|system|website)\b/i.test(lowerQuery);

    if (containsBannedTerm && !isCodingRelated) {
      isEducational = false;
    }

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

    // 1. Check MongoDB Cache first using cacheKey
    const cacheKey = lowerQuery + (req.query.pageToken ? "_" + req.query.pageToken : "");
    try {
      const cached = await SearchCache.findOne({ query: cacheKey });
      if (cached && cached.results) {
        console.log(`[Cache Hit] Serving search results for cacheKey: "${cacheKey}"`);
        if (Array.isArray(cached.results)) {
          const filteredCached = cached.results.filter(isEducationalVideo);
          return res.json({ items: filteredCached, nextPageToken: null });
        } else if (cached.results.items) {
          const filteredCached = cached.results.items.filter(isEducationalVideo);
          return res.json({ items: filteredCached, nextPageToken: cached.results.nextPageToken || null });
        }
      }
    } catch (cacheErr) {
      console.error("Cache read error:", cacheErr);
    }

    // 2. Fetch from YouTube API if not cached
    try {
      console.log(`[API Request] Querying YouTube API for: "${query}"`);
      const refinedQuery = getRefinedQuery(query);
      console.log(`[API Request] Refined query: "${refinedQuery}"`);
      
      const apiParams = {
        part: "snippet",
        maxResults: 50,
        q: refinedQuery,
        type: "video",
        key: process.env.YOUTUBE_API_KEY,
      };

      if (req.query.pageToken) {
        apiParams.pageToken = req.query.pageToken;
      }

      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        { params: apiParams }
      );

      const items = response.data.items || [];
      const filteredItems = items.filter(isEducationalVideo);
      const nextPageToken = response.data.nextPageToken || null;

      // Save to cache asynchronously (do not block client response)
      if (filteredItems.length > 0) {
        SearchCache.create({
          query: cacheKey,
          results: { items: filteredItems, nextPageToken }
        }).catch(cacheErr => console.error("Cache write error:", cacheErr));
      }

      return res.json({ items: filteredItems, nextPageToken });

    } catch (apiError) {
      console.error(`YouTube API error for query "${query}":`, apiError.message);
      
      // Serve fallback videos structured exactly like YouTube API results
      const fallbacks = getFallbackVideos(query);
      const filteredFallbacks = fallbacks.filter(isEducationalVideo);
      console.log(`[Fallback] Serving static educational fallback videos for: "${query}"`);
      return res.json({ items: filteredFallbacks, nextPageToken: null });
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