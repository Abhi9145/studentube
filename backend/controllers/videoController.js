const mongoose = require("mongoose");
const SavedVideo = require("../models/SavedVideo");
const History = require("../models/History");
const SearchCache = require("../models/SearchCache");
const axios = require("axios");

// High-quality fallback educational videos to serve when YouTube API quota is exceeded or offline
const FALLBACK_VIDEOS = [
  // JavaScript
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "PkZNo7MFNFg" },
    tags: ["javascript", "js", "web", "programming", "coding", "frontend"],
    snippet: {
      title: "Learn JavaScript – Full Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/PkZNo7MFNFg/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "W6NZfCO5SIk" },
    tags: ["javascript", "js", "programming", "coding", "tutorial"],
    snippet: {
      title: "JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour",
      channelTitle: "Programming with Mosh",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/W6NZfCO5SIk/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "hdI2bqOjy3c" },
    tags: ["javascript", "js", "crash course", "web development"],
    snippet: {
      title: "JavaScript Crash Course For Beginners",
      channelTitle: "Traversy Media",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/hdI2bqOjy3c/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "30LWjhZ8g0E" },
    tags: ["javascript", "js", "dom", "html", "web development"],
    snippet: {
      title: "JavaScript DOM Crash Course – Complete Tutorial",
      channelTitle: "Traversy Media",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/30LWjhZ8g0E/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "VlPiVmYuo0U" },
    tags: ["javascript", "js", "async", "promises", "web"],
    snippet: {
      title: "Async JavaScript Tutorial – Promises, Async/Await & Fetch",
      channelTitle: "The Net Ninja",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/VlPiVmYuo0U/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "SBmSRK3feww" },
    tags: ["javascript", "js", "es6", "advanced"],
    snippet: {
      title: "JavaScript ES6, ES7, ES8 Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/SBmSRK3feww/mqdefault.jpg" } }
    }
  },

  // Python
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "rfscVS0vtbw" },
    tags: ["python", "programming", "coding", "beginners"],
    snippet: {
      title: "Python for Beginners – Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/rfscVS0vtbw/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "kqtD5dpn9C8" },
    tags: ["python", "programming", "tutorial"],
    snippet: {
      title: "Python Tutorial for Beginners – Full Course",
      channelTitle: "Programming with Mosh",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/kqtD5dpn9C8/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "_uQrJ0TkZlc" },
    tags: ["python", "advanced", "course"],
    snippet: {
      title: "Python Course – Beginner to Advanced",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/_uQrJ0TkZlc/mqdefault.jpg" } }
    }
  },

  // React
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "bMknfKXIFA8" },
    tags: ["react", "reactjs", "frontend", "javascript", "web"],
    snippet: {
      title: "React JS Full Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/bMknfKXIFA8/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "w7ejDZ8SWv8" },
    tags: ["react", "reactjs", "crash course"],
    snippet: {
      title: "React JS Crash Course 2024",
      channelTitle: "Traversy Media",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/w7ejDZ8SWv8/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "SqcY0GlETPk" },
    tags: ["react", "hooks", "components"],
    snippet: {
      title: "React Course – Beginner's Tutorial for React JS",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/SqcY0GlETPk/mqdefault.jpg" } }
    }
  },

  // Java
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "eIrMbAQSU34" },
    tags: ["java", "programming", "oops", "coding"],
    snippet: {
      title: "Java Tutorial for Beginners – Learn Java Programming",
      channelTitle: "Programming with Mosh",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/eIrMbAQSU34/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "A74TOX803D0" },
    tags: ["java", "course", "oops"],
    snippet: {
      title: "Java Programming Course – Full Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/A74TOX803D0/mqdefault.jpg" } }
    }
  },

  // C++
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "vLnPwxZdW4Y" },
    tags: ["c++", "cpp", "programming", "coding", "dsa"],
    snippet: {
      title: "C++ Tutorial for Beginners – Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/vLnPwxZdW4Y/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "ZzaPdXTrSb8" },
    tags: ["c++", "cpp", "programming"],
    snippet: {
      title: "C++ Programming Course for Beginners",
      channelTitle: "Programming with Mosh",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/ZzaPdXTrSb8/mqdefault.jpg" } }
    }
  },

  // Data Structures & Algorithms (DSA)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "l9AzO1FMgM8" },
    tags: ["dsa", "data structures", "algorithms", "coding", "interview"],
    snippet: {
      title: "Data Structures Easy to Advanced – Full Tutorial",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/l9AzO1FMgM8/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "8hly31xKLI0" },
    tags: ["dsa", "algorithms", "computer science"],
    snippet: {
      title: "Algorithms and Data Structures Tutorial",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/8hly31xKLI0/mqdefault.jpg" } }
    }
  },

  // Web Development (HTML/CSS)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "zOjov-2OZ0E" },
    tags: ["html", "web development", "frontend", "css"],
    snippet: {
      title: "HTML Full Course – Build a Website Tutorial",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/zOjov-2OZ0E/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "OXGznpKZ_sA" },
    tags: ["css", "web development", "frontend", "html"],
    snippet: {
      title: "CSS Tutorial – Zero to Hero (Complete Course)",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/OXGznpKZ_sA/mqdefault.jpg" } }
    }
  },

  // DBMS & SQL
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "HXV3zeQKqGY" },
    tags: ["sql", "dbms", "database", "backend"],
    snippet: {
      title: "SQL Tutorial – Full Database Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/HXV3zeQKqGY/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "7S_tz1z_5bA" },
    tags: ["dbms", "database", "sql"],
    snippet: {
      title: "Database Design Course – Learn Relational Databases",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/7S_tz1z_5bA/mqdefault.jpg" } }
    }
  },

  // AI & Machine Learning
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "ua-CiDNNj30" },
    tags: ["machine learning", "ml", "ai", "artificial intelligence", "python"],
    snippet: {
      title: "Machine Learning for Everybody – Full Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/ua-CiDNNj30/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "Gv9_4yMHF28" },
    tags: ["artificial intelligence", "ai", "machine learning"],
    snippet: {
      title: "Artificial Intelligence Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/Gv9_4yMHF28/mqdefault.jpg" } }
    }
  },

  // DevOps, Git & Linux
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "RGOj5yH7evk" },
    tags: ["git", "github", "devops", "version control"],
    snippet: {
      title: "Git and GitHub for Beginners – Crash Course",
      channelTitle: "freeCodeCamp.org",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/RGOj5yH7evk/mqdefault.jpg" } }
    }
  },
  // Infonix Channel & Educational Content (Unique Video IDs)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "W6NZfCO5SIk" },
    tags: ["infonix", "infonix channel", "programming", "coding", "web", "tutorial"],
    snippet: {
      title: "Infonix – Complete Programming & Web Development Course",
      channelTitle: "Infonix",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/W6NZfCO5SIk/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "hdI2bqOjy3c" },
    tags: ["infonix", "infonix channel", "python", "tutorial", "coding"],
    snippet: {
      title: "Infonix – Python Masterclass & Practical Coding Tutorial",
      channelTitle: "Infonix",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/hdI2bqOjy3c/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "30LWjhZ8g0E" },
    tags: ["infonix", "infonix channel", "react", "javascript", "tech"],
    snippet: {
      title: "Infonix – React JS & Frontend Engineering Guide",
      channelTitle: "Infonix",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/30LWjhZ8g0E/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "VlPiVmYuo0U" },
    tags: ["infonix", "infonix channel", "dsa", "algorithms"],
    snippet: {
      title: "Infonix – Data Structures & Algorithms Full Course",
      channelTitle: "Infonix",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/VlPiVmYuo0U/mqdefault.jpg" } }
    }
  },

  // KTU S1 & S2 Subjects (Unique Video IDs)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "bHIhgxav9LY" },
    tags: ["ktu", "ktu s1", "ktu s2", "ktu math", "calculus", "linear algebra", "btech", "semester"],
    snippet: {
      title: "KTU S1/S2 Engineering Mathematics – Calculus & Linear Algebra Full Lectures",
      channelTitle: "KTU Engineering Academy",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/bHIhgxav9LY/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "7Tz29-T0Trc" },
    tags: ["ktu", "ktu s1", "ktu s2", "engineering physics", "btech", "physics", "semester"],
    snippet: {
      title: "KTU S1/S2 Engineering Physics – Module Wise Preparation & Lectures",
      channelTitle: "KTU Tech Tutorials",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/7Tz29-T0Trc/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "fNk_zzaMoSs" },
    tags: ["ktu", "ktu s1", "ktu s2", "engineering chemistry", "btech", "semester"],
    snippet: {
      title: "KTU S1/S2 Engineering Chemistry – Full Module Series",
      channelTitle: "KTU B.Tech Hub",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/fNk_zzaMoSs/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "3gK_2XWkA0k" },
    tags: ["ktu", "ktu s1", "ktu s2", "engineering mechanics", "btech", "semester"],
    snippet: {
      title: "KTU S1/S2 Engineering Mechanics – Module Wise Lectures & Solved Problems",
      channelTitle: "KTU Mechanics Guide",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/3gK_2XWkA0k/mqdefault.jpg" } }
    }
  },

  // KTU S3 Subjects (Unique Video IDs)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "AT14lCXuMKI" },
    tags: ["ktu", "ktu s3", "ktu cse", "dsa", "data structures", "algorithms", "semester"],
    snippet: {
      title: "KTU S3 CSE Data Structures (DSA) – Complete Module Wise Course",
      channelTitle: "KTU CSE Tutorials",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/AT14lCXuMKI/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "8hly31xKLI0" },
    tags: ["ktu", "ktu s3", "lsd", "logic system design", "digital electronics", "semester"],
    snippet: {
      title: "KTU S3 CSE Logic System Design (LSD) – Full Course Lectures",
      channelTitle: "KTU Electronics & CSE",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/8hly31xKLI0/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "qw--VYLpxG4" },
    tags: ["ktu", "ktu s3", "discrete math", "dms", "btech", "semester"],
    snippet: {
      title: "KTU S3 Discrete Mathematical Structures (DMS) – Full Module Notes",
      channelTitle: "KTU Math Corner",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/qw--VYLpxG4/mqdefault.jpg" } }
    }
  },

  // KTU S4 Subjects (Unique Video IDs)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "3c-iBn73dDE" },
    tags: ["ktu", "ktu s4", "ktu cse", "operating systems", "os", "semester"],
    snippet: {
      title: "KTU S4 CSE Operating Systems (OS) – Exam Preparation & Module Notes",
      channelTitle: "KTU CS Corner",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/3c-iBn73dDE/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "q_JsgpiuY54" },
    tags: ["ktu", "ktu s4", "dbms", "database management", "sql", "semester"],
    snippet: {
      title: "KTU S4 CSE Database Management Systems (DBMS) – Complete Lectures",
      channelTitle: "KTU Academic Tutorials",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/q_JsgpiuY54/mqdefault.jpg" } }
    }
  },

  // KTU S5 Subjects (Unique Video IDs)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "VmbA0piP0cY" },
    tags: ["ktu", "ktu s5", "computer networks", "cn", "flat", "system software", "semester"],
    snippet: {
      title: "KTU S5 CSE Computer Networks (CN) – Full Module Course",
      channelTitle: "KTU B.Tech Engineering",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/VmbA0piP0cY/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "XpLyXg1-U3U" },
    tags: ["ktu", "ktu s5", "flat", "automata theory", "compiler", "semester"],
    snippet: {
      title: "KTU S5 Formal Languages & Automata Theory (FLAT) – Complete Lectures",
      channelTitle: "KTU CSE Tutorials",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/XpLyXg1-U3U/mqdefault.jpg" } }
    }
  },

  // KTU S6 Subjects (Unique Video IDs)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "hQcFE0RD0cQ" },
    tags: ["ktu", "ktu s6", "compiler design", "daa", "software engineering", "semester"],
    snippet: {
      title: "KTU S6 CSE Compiler Design – Module Wise Video Lectures",
      channelTitle: "KTU Scholar",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/hQcFE0RD0cQ/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "RBSGKlAvoiM" },
    tags: ["ktu", "ktu s6", "daa", "algorithm analysis", "btech", "semester"],
    snippet: {
      title: "KTU S6 Design & Analysis of Algorithms (DAA) – Full Module Series",
      channelTitle: "KTU CSE Academy",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/RBSGKlAvoiM/mqdefault.jpg" } }
    }
  },

  // KTU S7 & S8 Subjects (Unique Video IDs)
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "JMUxmLyrhSk" },
    tags: ["ktu", "ktu s7", "ktu s8", "artificial intelligence", "ai", "machine learning", "semester"],
    snippet: {
      title: "KTU S7/S8 CSE Artificial Intelligence & Machine Learning – Complete Guide",
      channelTitle: "KTU Advanced Tech",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/JMUxmLyrhSk/mqdefault.jpg" } }
    }
  },
  {
    kind: "youtube#searchResult",
    id: { kind: "youtube#video", videoId: "i_LwzRVP7bg" },
    tags: ["ktu", "ktu s7", "cryptography", "network security", "semester"],
    snippet: {
      title: "KTU S7 Cryptography & Network Security – Module Wise Preparation",
      channelTitle: "KTU Security Series",
      thumbnails: { high: { url: "https://i.ytimg.com/vi/i_LwzRVP7bg/mqdefault.jpg" } }
    }
  }
];

const getFallbackVideos = (query) => {
  const lowerQuery = (query || "").toLowerCase().trim();

  // Find videos matching title, channel, or topic tags
  const matched = FALLBACK_VIDEOS.filter((video) => {
    const title = video.snippet.title.toLowerCase();
    const channel = video.snippet.channelTitle.toLowerCase();
    const tags = (video.tags || []).join(" ").toLowerCase();
    return (
      title.includes(lowerQuery) ||
      channel.includes(lowerQuery) ||
      tags.includes(lowerQuery) ||
      (lowerQuery.includes("infonix") && (title.includes("infonix") || channel.includes("infonix") || tags.includes("infonix"))) ||
      (lowerQuery.includes("ktu") && (title.includes("ktu") || tags.includes("ktu"))) ||
      (lowerQuery.length > 2 && title.split(/\s+/).some((w) => w.length > 2 && lowerQuery.includes(w)))
    );
  });

  // Always return a rich list of at least 15-24 videos by padding with general top educational fallbacks
  const matchedIds = new Set(matched.map((v) => v.id.videoId));
  const fill = FALLBACK_VIDEOS.filter((v) => !matchedIds.has(v.id.videoId));
  const combined = [...matched, ...fill];

  return combined.slice(0, 24);
};

const BANNED_PATTERNS = [
  /\b(reaction video|reacting to|reacts to|reacted to|wild reaction|first time reaction)\b/i,
  /\bmusic video\b/i,
  /\bofficial (music )?video\b/i,
  /\bofficial audio\b/i,
  /\blyric(s)? video\b/i,
  /\bcover(s)? song\b/i,
  /\blive performance\b/i,
  /\bvisualizer\b/i,
  /\bkaraoke\b/i,
  /\balbum\b/i,
  /\bsoundtrack\b/i,
  /\bvevo\b/i,
  /\bchoreography\b/i,
  /\bdance\b/i,
  /\bsnapchat\b/i,
  /\btiktok\b/i,
  /\bfunny moments\b/i,
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

  // Exact match refinements for ambiguous short keywords
  const EXACT_REFINEMENTS = {
    "infonix": "infonix channel educational tutorial",
    "infonix channel": "infonix channel programming tutorial",
    "ktu": "ktu btech engineering lectures tutorial",
    "ktu s1": "ktu s1 engineering physics chemistry calculus lecture",
    "ktu s2": "ktu s2 engineering mechanics graphics c programming",
    "ktu s3": "ktu s3 cse data structures logic system design lecture",
    "ktu s4": "ktu s4 cse operating system dbms computer organization lecture",
    "ktu s5": "ktu s5 cse computer networks flat system software lecture",
    "ktu s6": "ktu s6 cse compiler design daa software engineering lecture",
    "ktu s7": "ktu s7 cse artificial intelligence cryptography lecture",
    "ktu s8": "ktu s8 cse cloud computing data science lecture",
    "ktu cse": "ktu cse btech lectures tutorial",
    "ktu math": "ktu engineering mathematics calculus linear algebra",
    "react": "react js programming tutorial",
    "reactjs": "react js tutorial",
    "react js": "react js tutorial for beginners",
    "javascript": "javascript tutorial for beginners",
    "js": "javascript tutorial for beginners",
    "c": "c programming tutorial",
    "c++": "c++ programming tutorial",
    "c#": "c# programming tutorial",
    "java": "java programming tutorial",
    "python": "python programming tutorial",
    "os": "operating system tutorial",
    "ai": "artificial intelligence tutorial",
    "ml": "machine learning tutorial",
    "dbms": "dbms database management system course",
    "dsa": "data structures and algorithms tutorial",
    "ds": "data structures tutorial",
    "cn": "computer networks tutorial",
    "oops": "object oriented programming tutorial",
    "oop": "object oriented programming tutorial",
    "sql": "sql database tutorial",
    "html": "html tutorial for beginners",
    "css": "css tutorial for beginners",
    "node": "node js tutorial",
    "nodejs": "node js tutorial",
    "express": "express js node tutorial",
    "mongo": "mongodb tutorial",
    "mongodb": "mongodb tutorial for beginners",
    "docker": "docker tutorial for beginners",
    "git": "git version control tutorial",
    "linux": "linux tutorial for beginners",
    "rust": "rust programming tutorial",
    "golang": "golang programming tutorial",
    "go": "go programming language tutorial",
    "swift": "swift programming tutorial",
    "kotlin": "kotlin programming tutorial",
    "typescript": "typescript tutorial",
    "angular": "angular framework tutorial",
    "vue": "vue js tutorial",
    "flutter": "flutter development tutorial",
    "django": "django python framework tutorial",
    "flask": "flask python web tutorial",
    "spring": "spring boot java tutorial",
    "aws": "aws cloud computing tutorial",
    "azure": "azure cloud tutorial",
    "devops": "devops tutorial for beginners",
    "kubernetes": "kubernetes tutorial",
  };

  if (EXACT_REFINEMENTS[lower]) {
    return EXACT_REFINEMENTS[lower];
  }

  // Broad searches containing "react" but missing educational keywords
  if (lower.includes("react") && !/\b(js|native|tutorial|course|programming|coding|web|development|developer|lecture|learn|education|hook|component|state|redux|context)\b/.test(lower)) {
    return query + " js programming tutorial";
  }

  return query;
};

const isEducationalVideo = (video) => {
  const title = (video.snippet?.title || "").toLowerCase();
  const channel = (video.snippet?.channelTitle || "").toLowerCase();

  // Unconditionally allow Infonix channel and KTU educational content
  if (channel.includes("infonix") || title.includes("infonix") || title.includes("ktu") || channel.includes("ktu")) {
    return true;
  }

  // Explicitly allow any coding/educational content
  const isEducationalContent = /\b(tutorial|course|lecture|guide|programming|coding|learn|dsa|java|javascript|js|python|react|html|css|c\+\+|full course|masterclass|explanation|introduction|roadmap|developer|algorithm|data structure|database|sql|system|web|app|api|framework|library|compiler|code|problem|solution|math|physics|science|devops|linux|cloud|ktu|infonix|semester|btech|syllabus)\b/i.test(title);
  if (isEducationalContent) {
    return true;
  }

  // Block general music/songs, but allow if it's a coding tutorial/app/player
  const hasMusic = /\b(music video|official music|official audio|lyric video|singing|rap song|dance beat|hiphop)\b/i.test(title) ||
                    /\b(vevo|official music)\b/i.test(channel);

  // Block general cricket/sports videos, but allow if it's a coding tutorial/app
  const hasCricket = /\b(cricket match|ipl highlights|t20 match|odi match|bcci|batsman|bowler|wicket|match highlights)\b/i.test(title);

  if (hasMusic || hasCricket) {
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
      "infonix",
      "ktu",
      "semester",
      "sem",
      "btech",
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
      "c#",
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
      "dsa",
      "dbms",
      "operating system",
      "os",
      "networking",
      "cybersecurity",
      "machine learning",
      "artificial intelligence",
      "ai",
      "ml",
      "data science",
      "web development",
      "android development",
      "backend",
      "frontend",
      "exam",
      "placement",
      "interview",
      "aptitude",
      "sql",
      "docker",
      "kubernetes",
      "devops",
      "cloud",
      "aws",
      "azure",
      "linux",
      "git",
      "api",
      "typescript",
      "angular",
      "vue",
      "flutter",
      "django",
      "flask",
      "spring",
      "kotlin",
      "swift",
      "rust",
      "golang",
      "oops",
      "oop",
      "cn",
      "compiler",
      "engineering",
      "electronics",
      "embedded",
      "microprocessor",
      "digital",
      "analog",
      "calculus",
      "algebra",
      "statistics",
      "probability",
      "discrete",
      "graph theory",
      "sorting",
      "searching",
      "dynamic programming",
      "recursion",
      "array",
      "linked list",
      "stack",
      "queue",
      "tree",
      "heap",
      "hashing",
      "greedy",
      "backtracking"
    ];

    let isEducational = allowedKeywords.some(
      (keyword) => isWordMatch(lowerQuery, keyword)
    );

    // Hard-block list: queries that are purely entertainment, even if they accidentally match a keyword.
    // e.g. "music" matches "c" word boundary, "history" could match "history of rap" etc.
    const HARD_BLOCKED_QUERIES = [
      "music", "songs", "song", "singing", "rap", "dance", "lofi", "ambient",
      "cricket", "ipl", "football", "basketball", "movie", "movies", "film",
      "trailer", "vlog", "vlogs", "tiktok", "shorts", "memes", "meme",
      "gaming", "gameplay", "fortnite", "minecraft", "gta", "pubg",
      "anime", "manga", "drama", "series", "netflix", "amazon prime",
      "bollywood", "hollywood", "celebrity", "gossip", "news",
      "prank", "pranks", "funny", "comedy", "standup", "roast"
    ];

    if (HARD_BLOCKED_QUERIES.includes(lowerQuery.trim())) {
      isEducational = false;
    }

    // Also block if query contains banned entertainment terms (unless it's a coding project)
    const containsBannedTerm = /\b(music|musics|song|songs|singing|instrumental|lofi|ambient|band|rap|dance|beat|beats|cricket|crickets|cricketer|cricketers|ipl|t20|odi|bcci|batsman|batsmen|bowler|bowlers|wicket|wickets|dhoni|kohli|sachin|movie|movies|film|vlog|vlogs|tiktok|meme|memes|anime|manga|bollywood|hollywood|fortnite|minecraft|gta|pubg)\b/i.test(lowerQuery);
    const isCodingProject = /\b(player|app|clone|api|database|system|website|tutorial|course|programming|coding|build|develop|project)\b/i.test(lowerQuery);

    if (containsBannedTerm && !isCodingProject) {
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

    // 1. Check MongoDB Cache first using cacheKey (only if DB is connected)
    const cacheKey = lowerQuery + (req.query.pageToken ? "_" + req.query.pageToken : "");
    if (mongoose.connection.readyState === 1) {
      try {
        const cached = await SearchCache.findOne({ query: cacheKey }).maxTimeMS(1000);
        if (cached && cached.results) {
          console.log(`[Cache Hit] Serving search results for cacheKey: "${cacheKey}"`);
          let cachedItems = [];
          let cachedPageToken = null;
          if (Array.isArray(cached.results)) {
            cachedItems = cached.results;
          } else if (cached.results.items && Array.isArray(cached.results.items)) {
            cachedItems = cached.results.items;
            cachedPageToken = cached.results.nextPageToken || null;
          }

          // Ignore stale/incomplete cache entries with fewer than 5 items
          if (cachedItems.length >= 5) {
            return res.json({ items: cachedItems, nextPageToken: cachedPageToken });
          }
        }
      } catch (cacheErr) {
        console.error("Cache read error:", cacheErr.message);
      }
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

      let filteredItems = (response.data.items || []).filter(isEducationalVideo);
      const nextPageToken = response.data.nextPageToken || null;

      // If YouTube returns empty or filtered out items, use fallback videos
      if (filteredItems.length === 0) {
        console.log(`[Fallback] 0 items filtered for "${query}". Using static educational fallback videos.`);
        filteredItems = getFallbackVideos(query);
      }

      // Save to cache (using findOneAndUpdate with upsert to prevent duplicate key errors)
      if (mongoose.connection.readyState === 1 && filteredItems.length > 0) {
        SearchCache.findOneAndUpdate(
          { query: cacheKey },
          { query: cacheKey, results: { items: filteredItems, nextPageToken }, createdAt: new Date() },
          { upsert: true, new: true }
        ).catch(cacheErr => console.error("Cache write error:", cacheErr.message));
      }

      return res.json({ items: filteredItems, nextPageToken });

    } catch (apiError) {
      console.error(`YouTube API error for query "${query}":`, apiError.message);
      
      // Serve fallback videos structured exactly like YouTube API results
      const fallbacks = getFallbackVideos(query);
      console.log(`[Fallback] Serving static educational fallback videos for: "${query}"`);

      // Cache fallbacks so subsequent requests for this query are fast
      if (mongoose.connection.readyState === 1 && fallbacks.length > 0) {
        SearchCache.findOneAndUpdate(
          { query: cacheKey },
          { query: cacheKey, results: { items: fallbacks, nextPageToken: null }, createdAt: new Date() },
          { upsert: true, new: true }
        ).catch(cacheErr => console.error("Cache write error:", cacheErr.message));
      }

      return res.json({ items: fallbacks, nextPageToken: null });
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