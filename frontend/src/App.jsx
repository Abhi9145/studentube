import "./App.css";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import TopicChips from "./components/TopicChips";
import VideoCard from "./components/VideoCard";
import ContinueWatching from "./components/ContinueWatching";
import { API_URL } from "./config";

// Status constants
const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  BLOCKED: "blocked",
};

// A rich list of educational topics to pull recommendations from
const RECOMMENDATION_QUERIES = [
  "computer science tutorial",
  "programming tutorial",
  "python tutorial",
  "web development tutorial",
  "javascript crash course",
  "data structures algorithms",
  "machine learning beginners",
  "database sql course",
  "cybersecurity crash course",
  "react js tutorial",
  "artificial intelligence basics",
  "git github tutorial",
  "docker container tutorial",
  "linux terminal guide"
];

function App() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHome, setIsHome] = useState(true);
  const [status, setStatus] = useState(STATUS.LOADING);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastQuery, setLastQuery] = useState(() => {
    return RECOMMENDATION_QUERIES[Math.floor(Math.random() * RECOMMENDATION_QUERIES.length)];
  });

  // ── Theme initialization ───────────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // ── Shared fetch helper ─────────────────────────────────────────────────────
  const doSearch = useCallback(async (query) => {
    setStatus(STATUS.LOADING);
    setLastQuery(query);

    try {
      const res = await fetch(
        `${API_URL}/api/videos/search?q=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      const data = await res.json();

      // Non-educational rejection from backend
      if (data.educationalOnly) {
        toast(data.message, { icon: "📚", duration: 4000 });
        setStatus(STATUS.BLOCKED);
        setVideos([]);
        return;
      }

      // Backend sent an error message object
      if (data.message && !Array.isArray(data) && !data.items) {
        throw new Error(data.message);
      }

      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
        ? data.items
        : [];

      // Filter out malformed entries (missing videoId or thumbnail)
      const validItems = rawItems.filter(
        (v) => v?.id?.videoId && (v?.snippet?.thumbnails?.high?.url || v?.snippet?.thumbnails?.medium?.url || v?.snippet?.thumbnails?.default?.url)
      );

      setVideos(validItems);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      console.error("Search error:", err);
      setErrorMsg(err.message || "Could not load videos.");
      setStatus(STATUS.ERROR);
      setVideos([]);
    }
  }, []);

  // ── Load recommendations helper ──────────────────────────────────────────
  const loadRecommendations = useCallback(async () => {
    setStatus(STATUS.LOADING);
    const shuffled = [...RECOMMENDATION_QUERIES].sort(() => Math.random() - 0.5);
    const targetQueries = shuffled.slice(0, 3);
    const allVideos = [];
    const seenIds = new Set();

    try {
      const fetchPromises = targetQueries.map(async (q) => {
        try {
          const res = await fetch(
            `${API_URL}/api/videos/search?q=${encodeURIComponent(q)}`
          );
          if (!res.ok) return [];
          const data = await res.json();
          if (data.educationalOnly) return [];
          
          const rawItems = Array.isArray(data)
            ? data
            : Array.isArray(data.items)
            ? data.items
            : [];
            
          return rawItems.filter(
            (v) => v?.id?.videoId && (v?.snippet?.thumbnails?.high?.url || v?.snippet?.thumbnails?.medium?.url || v?.snippet?.thumbnails?.default?.url)
          );
        } catch {
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      
      for (const list of results) {
        for (const v of list) {
          const id = v.id.videoId;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            allVideos.push(v);
          }
        }
      }
    } catch (err) {
      console.error("Load recommendations error:", err);
    }

    if (allVideos.length > 0) {
      const mixedVideos = allVideos.sort(() => Math.random() - 0.5);
      setVideos(mixedVideos.slice(0, 16));
      setStatus(STATUS.SUCCESS);
    } else {
      setErrorMsg(
        "YouTube API may be temporarily unavailable or the daily quota has been reached."
      );
      setStatus(STATUS.ERROR);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = (customQuery) => {
    const query = typeof customQuery === "string" ? customQuery : searchTerm;
    if (!query.trim()) return;
    setIsHome(false);
    doSearch(query);
  };

  const handleCategoryClick = (category) => {
    setSearchTerm(category);
    setIsHome(false);
    doSearch(category);
  };

  const handleHomeClick = () => {
    setSearchTerm("");
    setIsHome(true);
    loadRecommendations();
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (status === STATUS.LOADING) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            gap: "16px",
            color: "var(--faint-text)",
          }}
        >
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
          <div
            style={{
              width: "38px",
              height: "38px",
              border: "3px solid var(--border-color)",
              borderTop: "3px solid #ff0000",
              borderRadius: "50%",
              animation: "spin 0.75s linear infinite",
            }}
          />
          <p style={{ fontSize: "14px" }}>Loading recommended videos…</p>
        </div>
      );
    }

    if (status === STATUS.ERROR) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "70px 20px",
            background: "var(--card-bg)",
            borderRadius: "16px",
            border: "1px dashed var(--card-border)",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "16px" }}>😵</div>
          <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "var(--text-secondary)" }}>
            Couldn&apos;t load videos
          </h3>
          <p
            style={{
              color: "var(--faint-text)",
              fontSize: "14px",
              maxWidth: "400px",
              margin: "0 auto 24px",
              lineHeight: "1.6",
            }}
          >
            {errorMsg}
          </p>
          <button
            onClick={() => doSearch(lastQuery)}
            style={{
              background: "#ff0000",
              color: "#fff",
              border: "none",
              borderRadius: "20px",
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255,0,0,.3)",
              transition: ".2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            🔄 Try Again
          </button>
        </div>
      );
    }

    if (status === STATUS.BLOCKED || videos.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "70px 20px",
            background: "var(--card-bg)",
            borderRadius: "16px",
            border: "1px dashed var(--card-border)",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "16px" }}>📚</div>
          <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "var(--text-secondary)" }}>
            Educational content only
          </h3>
          <p style={{ color: "var(--faint-text)", fontSize: "14px" }}>
            Try searching for Python, React, DSA, Math, Physics, or any study topic.
          </p>
        </div>
      );
    }

    return (
      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard
            key={video.id?.videoId}
            video={{
              title: video.snippet?.title,
              channel: video.snippet?.channelTitle,
              thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
              videoId: video.id?.videoId,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        onLogoClick={handleHomeClick}
      />

      <div className="layout">
        <Sidebar onCategoryClick={handleCategoryClick} onHomeClick={handleHomeClick} />

        <div className="main-content">
          <TopicChips onTopicClick={handleCategoryClick} />

          {isHome && <ContinueWatching />}

          <h2 style={{ marginBottom: "20px" }}>
            {isHome ? "🔥 Recommended Videos" : `🔍 Search Results for "${searchTerm || lastQuery}"`}
          </h2>

          {renderContent()}
        </div>
      </div>
    </>
  );
}

export default App;