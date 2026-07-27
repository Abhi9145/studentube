import "./App.css";
import { useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import TopicChips from "./components/TopicChips";
import VideoCard from "./components/VideoCard";
import ContinueWatching from "./components/ContinueWatching";
import { API_URL } from "./config";
import { getProxiedThumbnail } from "./utils/thumbnail";

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
  "python tutorial for beginners",
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
  "linux terminal guide",
  "dsa tutorial",
  "java programming course",
  "c++ programming tutorial",
  "node js express tutorial",
  "html css tutorial",
  "typescript tutorial",
  "angular tutorial",
  "vue js tutorial",
  "flutter development",
  "django python tutorial",
  "spring boot java",
  "aws cloud tutorial",
  "devops tutorial",
  "kubernetes tutorial",
  "rust programming",
  "golang tutorial",
  "sql database tutorial",
  "operating system lecture",
  "computer networks tutorial",
  "object oriented programming",
  "dynamic programming tutorial",
  "system design interview",
  "placement preparation coding",
  "physics lecture",
  "calculus mathematics course",
  "statistics probability tutorial",
];

// Helpers for video ID & thumbnail extraction
const getVideoId = (v) => {
  if (!v) return null;
  if (v.id?.videoId) return v.id.videoId;
  if (typeof v.id === "string") return v.id;
  if (v.videoId) return v.videoId;
  return null;
};

const getVideoThumbnail = (v) => {
  if (!v) return null;
  const url =
    v.snippet?.thumbnails?.high?.url ||
    v.snippet?.thumbnails?.medium?.url ||
    v.snippet?.thumbnails?.default?.url ||
    v.thumbnail;
  if (url) return url;
  const id = getVideoId(v);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

const filterValidItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((v) => {
    const id = getVideoId(v);
    const thumb = getVideoThumbnail(v);
    return Boolean(id && thumb);
  });
};

function App() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHome, setIsHome] = useState(true);
  const [status, setStatus] = useState(STATUS.LOADING);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastQuery, setLastQuery] = useState(() => {
    return RECOMMENDATION_QUERIES[Math.floor(Math.random() * RECOMMENDATION_QUERIES.length)];
  });

  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recommendationQueriesQueue, setRecommendationQueriesQueue] = useState([]);

  // Ref to track whether we are currently on the home screen.
  const isHomeRef = useRef(true);

  // AbortController ref to cancel in-flight recommendation fetches
  const recommendationAbortRef = useRef(null);

  // ── Theme initialization ───────────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // ── Shared fetch helper ─────────────────────────────────────────────────────
  const doSearch = useCallback(async (query) => {
    // Cancel any in-flight recommendation fetches so they can't
    // overwrite the search results we're about to display.
    if (recommendationAbortRef.current) {
      recommendationAbortRef.current.abort();
      recommendationAbortRef.current = null;
    }

    setStatus(STATUS.LOADING);
    setLastQuery(query);
    setNextPageToken(null);

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

      const validItems = filterValidItems(rawItems);

      setVideos(validItems);
      setNextPageToken(data.nextPageToken || null);
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
    if (recommendationAbortRef.current) {
      recommendationAbortRef.current.abort();
    }
    const abortController = new AbortController();
    recommendationAbortRef.current = abortController;

    setStatus(STATUS.LOADING);
    const shuffled = [...RECOMMENDATION_QUERIES].sort(() => Math.random() - 0.5);

    const firstQuery = shuffled[0];
    const backgroundQueries = shuffled.slice(1, 2);
    const remaining = shuffled.slice(2);

    const fetchQuery = async (q) => {
      try {
        const res = await fetch(
          `${API_URL}/api/videos/search?q=${encodeURIComponent(q)}`,
          { signal: abortController.signal }
        );
        if (!res.ok) return [];
        const data = await res.json();
        if (data.educationalOnly) return [];
        const rawItems = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];
        return filterValidItems(rawItems);
      } catch (err) {
        if (err.name === "AbortError") return [];
        return [];
      }
    };

    try {
      const firstBatch = await fetchQuery(firstQuery);

      if (!isHomeRef.current || abortController.signal.aborted) return;

      if (firstBatch.length > 0) {
        setVideos(firstBatch);
        setStatus(STATUS.SUCCESS);
        setRecommendationQueriesQueue(shuffled.slice(1));

        Promise.all(backgroundQueries.map(fetchQuery)).then((results) => {
          if (!isHomeRef.current || abortController.signal.aborted) return;

          const newItems = results.flat();
          if (newItems.length > 0) {
            setVideos((prev) => {
              const existingIds = new Set(prev.map((v) => getVideoId(v)).filter(Boolean));
              const uniqueNew = newItems.filter((v) => {
                const id = getVideoId(v);
                return id && !existingIds.has(id);
              });
              return [...prev, ...uniqueNew];
            });
            setRecommendationQueriesQueue(remaining);
          }
        }).catch((err) => {
          if (err.name !== "AbortError") console.error(err);
        });

        return;
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Initial load error:", err);
    }

    for (const q of shuffled) {
      if (!isHomeRef.current || abortController.signal.aborted) return;
      const items = await fetchQuery(q);
      if (!isHomeRef.current || abortController.signal.aborted) return;
      if (items.length > 0) {
        setVideos(items);
        setRecommendationQueriesQueue(shuffled.slice(shuffled.indexOf(q) + 1));
        setStatus(STATUS.SUCCESS);
        return;
      }
    }

    if (!isHomeRef.current || abortController.signal.aborted) return;
    setErrorMsg(
      "YouTube API may be temporarily unavailable or the daily quota has been reached."
    );
    setStatus(STATUS.ERROR);
  }, []);

  // ── Infinite scroll page fetcher ──────────────────────────────────────────
  const loadMoreVideos = useCallback(async () => {
    if (loadingMore) return;

    if (isHome) {
      if (recommendationQueriesQueue.length === 0) return;
      setLoadingMore(true);

      const nextQueue = [...recommendationQueriesQueue];
      const q = nextQueue.shift();
      setRecommendationQueriesQueue(nextQueue);

      try {
        const res = await fetch(
          `${API_URL}/api/videos/search?q=${encodeURIComponent(q)}`
        );
        if (res.ok) {
          const data = await res.json();
          const rawItems = Array.isArray(data)
            ? data
            : Array.isArray(data.items)
            ? data.items
            : [];

          const validItems = filterValidItems(rawItems);

          if (validItems.length > 0) {
            setVideos((prev) => {
              const existingIds = new Set(prev.map((v) => getVideoId(v)).filter(Boolean));
              const newUnique = validItems.filter((v) => {
                const id = getVideoId(v);
                return id && !existingIds.has(id);
              });
              return [...prev, ...newUnique];
            });
          }
        }
      } catch (err) {
        console.error("Load more recommendations error:", err);
      } finally {
        setLoadingMore(false);
      }
    } else {
      if (!nextPageToken) return;
      setLoadingMore(true);

      try {
        const query = searchTerm;
        const res = await fetch(
          `${API_URL}/api/videos/search?q=${encodeURIComponent(query)}&pageToken=${nextPageToken}`
        );
        if (res.ok) {
          const data = await res.json();
          const rawItems = Array.isArray(data)
            ? data
            : Array.isArray(data.items)
            ? data.items
            : [];

          const validItems = filterValidItems(rawItems);

          if (validItems.length > 0) {
            setVideos((prev) => {
              const existingIds = new Set(prev.map((v) => getVideoId(v)).filter(Boolean));
              const newUnique = validItems.filter((v) => {
                const id = getVideoId(v);
                return id && !existingIds.has(id);
              });
              return [...prev, ...newUnique];
            });
          }
          setNextPageToken(data.nextPageToken || null);
        }
      } catch (err) {
        console.error("Load more search results error:", err);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [loadingMore, isHome, recommendationQueriesQueue, nextPageToken, searchTerm]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // ── Scroll event listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (status !== STATUS.SUCCESS || loadingMore) return;
      
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;
      if (isNearBottom) {
        loadMoreVideos();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [status, loadingMore, loadMoreVideos]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = (customQuery) => {
    const query = typeof customQuery === "string" ? customQuery : searchTerm;
    if (!query.trim()) return;
    isHomeRef.current = false;
    setIsHome(false);
    doSearch(query);
  };

  const handleCategoryClick = (category) => {
    setSearchTerm(category);
    isHomeRef.current = false;
    setIsHome(false);
    doSearch(category);
  };

  const handleHomeClick = () => {
    setSearchTerm("");
    isHomeRef.current = true;
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

    if (status === STATUS.BLOCKED) {
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

    if (status === STATUS.SUCCESS && videos.length === 0) {
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
          <div style={{ fontSize: "42px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "var(--text-secondary)" }}>
            No videos found for &quot;{searchTerm || lastQuery}&quot;
          </h3>
          <p style={{ color: "var(--faint-text)", fontSize: "14px", marginBottom: "20px" }}>
            Try searching for another educational topic like Python, React, DSA, Math, or C++.
          </p>
          <button
            onClick={handleHomeClick}
            style={{
              background: "#ff0000",
              color: "#fff",
              border: "none",
              borderRadius: "20px",
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🏠 Return Home
          </button>
        </div>
      );
    }

    return (
      <div className="video-grid">
        {videos.map((video, idx) => {
          const vId = getVideoId(video);
          const vThumb = getVideoThumbnail(video);
          return (
            <VideoCard
              key={vId || idx}
              video={{
                title: video.snippet?.title || video.title || "Educational Video",
                channel: video.snippet?.channelTitle || video.channel || "YouTube",
                thumbnail: getProxiedThumbnail(vThumb),
                videoId: vId,
              }}
            />
          );
        })}
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
        <Sidebar
          onCategoryClick={handleCategoryClick}
          onHomeClick={handleHomeClick}
          activeCategory={!isHome ? (searchTerm || lastQuery) : ""}
        />

        <div className="main-content">
          <TopicChips
            onTopicClick={handleCategoryClick}
            activeTopic={!isHome ? (searchTerm || lastQuery) : ""}
          />

          {isHome && <ContinueWatching />}

          <h2 style={{ marginBottom: "20px" }}>
            {isHome ? "🔥 Recommended Videos" : `🔍 Results for "${searchTerm || lastQuery}"`}
          </h2>

          {renderContent()}

          {loadingMore && (
            <div style={{ display: "flex", justifyContent: "center", padding: "30px 20px" }}>
              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  border: "2px solid var(--border-color)",
                  borderTop: "2px solid #ff0000",
                  borderRadius: "50%",
                  animation: "spin 0.75s linear infinite",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;