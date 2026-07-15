import { API_URL } from "../config";
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import RelatedVideos from "../components/RelatedVideos";

/* ── Helpers ── */
const STORAGE_KEY = (id) => `yt_progress_${id}`;

function formatTime(secs) {
  if (!secs || secs < 1) return null;
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VideoPage() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();

  // Resume time: prefer URL ?t=, fallback to localStorage
  const urlTime = parseInt(searchParams.get("t") || "0", 10);
  const storedTime = parseInt(localStorage.getItem(STORAGE_KEY(videoId)) || "0", 10);
  const resumeAt = urlTime > 0 ? urlTime : storedTime;

  const [videoMeta, setVideoMeta] = useState({ title: "", channel: "", description: "", thumbnail: "" });
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [iframeStarted, setIframeStarted] = useState(false);

  const saveTimerRef = useRef(null);
  const watchedSecondsRef = useRef(resumeAt);

  // Build embed URL with autoplay + optional start time
  const buildEmbedUrl = useCallback((startSec = 0) => {
    const base = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      enablejsapi: "1",
    });
    if (startSec > 0) params.set("start", String(Math.floor(startSec)));
    return `${base}?${params.toString()}`;
  }, [videoId]);

  // Always auto-resume — no manual prompt
  const [embedUrl, setEmbedUrl] = useState(() => buildEmbedUrl(resumeAt));

  // ── Save history to backend ────────────────────────────────────────────────
  const saveHistory = useCallback(async (secs) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Also persist to localStorage for instant recovery
    if (secs > 5) localStorage.setItem(STORAGE_KEY(videoId), String(Math.floor(secs)));

    try {
      await fetch(`${API_URL}/api/videos/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId,
          title: videoMeta.title || `Video ${videoId}`,
          thumbnail:
            videoMeta.thumbnail ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          channel: videoMeta.channel || "YouTube",
          watchedSeconds: Math.floor(secs),
        }),
      });
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  }, [videoId, videoMeta]);

  // ── Periodic save every 15s while watching ────────────────────────────────
  useEffect(() => {
    if (!iframeStarted) return;

    // Increment a counter every second to approximate position
    // (real-time sync via postMessage would need YouTube IFrame API)
    let elapsed = watchedSecondsRef.current;
    const tick = setInterval(() => {
      elapsed += 1;
      watchedSecondsRef.current = elapsed;
      localStorage.setItem(STORAGE_KEY(videoId), String(Math.floor(elapsed)));
    }, 1000);

    saveTimerRef.current = setInterval(() => {
      saveHistory(watchedSecondsRef.current);
    }, 15000);

    return () => {
      clearInterval(tick);
      clearInterval(saveTimerRef.current);
      // Save on unmount
      saveHistory(watchedSecondsRef.current);
    };
  }, [iframeStarted, videoId, saveHistory]);

  // ── Fetch related videos + initial history entry ───────────────────────────
  useEffect(() => {
    // Initial history entry (marks as watched)
    saveHistory(resumeAt);

    fetch(`${API_URL}/api/videos/search?q=programming tutorial`)
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items || [];
        const validItems = items.filter(
          (v) => v?.id?.videoId && (v?.snippet?.thumbnails?.high?.url || v?.snippet?.thumbnails?.medium?.url || v?.snippet?.thumbnails?.default?.url)
        );
        setRelatedVideos(validItems);
      })
      .catch(console.error);

    // Fetch video title/channel/description from backend
    fetch(`${API_URL}/api/videos/details/${videoId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setVideoMeta({
          title: data.title || "",
          channel: data.channel || "YouTube",
          description: data.description || "",
          thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch video details from backend:", err);
        // Fallback to oEmbed if backend fails
        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
          .then((r) => r.json())
          .then((d) => {
            setVideoMeta({
              title: d.title || "",
              channel: d.author_name || "YouTube",
              description: "",
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            });
          })
          .catch(() => {
            setVideoMeta({
              title: "",
              channel: "YouTube",
              description: "",
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            });
          });
      });

    // Reset per-video
    watchedSecondsRef.current = resumeAt;
    setDescriptionExpanded(false);

    return () => {
      clearInterval(saveTimerRef.current);
    };
  }, [videoId]);

  const handleIframeLoad = () => {
    setIframeStarted(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const descriptionText = videoMeta.description || "";
  const isLongDescription = descriptionText.length > 200;
  const displayDescription = descriptionExpanded || !isLongDescription 
    ? descriptionText 
    : `${descriptionText.slice(0, 200)}...`;

  return (
    <div style={{ display: "flex", gap: "24px", padding: "20px", alignItems: "flex-start" }}>

      {/* ── Main player column ── */}
      <div style={{ flex: 3, minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* iframe — always rendered immediately, auto-starts at resumeAt */}
        <div
          style={{
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,.6)",
            aspectRatio: "16/9",
            background: "#000",
          }}
        >
          <iframe
            key={embedUrl}
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube Video Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            style={{ display: "block" }}
          />
        </div>

        {/* Video Title & Meta Card */}
        <div className="video-details-card" style={{
          background: "var(--card-bg, #181818)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          border: "1px solid var(--border-color, #222)",
        }}>
          <h1 style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "var(--text-color, #fff)",
            margin: "0 0 16px 0",
            lineHeight: "1.4"
          }}>
            {videoMeta.title || "Loading video title..."}
          </h1>

          {/* Channel Row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--border-color, #222)"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff0000 0%, #b30000 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "#fff",
              fontSize: "18px",
              textTransform: "uppercase"
            }}>
              {videoMeta.channel ? videoMeta.channel.charAt(0) : "Y"}
            </div>
            <div>
              <div style={{
                fontWeight: "600",
                fontSize: "16px",
                color: "var(--text-color, #fff)"
              }}>
                {videoMeta.channel || "YouTube Channel"}
              </div>
              <div style={{
                fontSize: "12px",
                color: "var(--muted-text, #888)",
                marginTop: "2px"
              }}>
                Verified Creator
              </div>
            </div>
          </div>

          {/* Description Container */}
          <div style={{
            background: "var(--secondary-bg, #161616)",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "var(--text-color, #ccc)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            border: "1px solid var(--border-color, #222)"
          }}>
            <strong style={{ display: "block", marginBottom: "8px", color: "var(--text-color, #fff)" }}>
              Description
            </strong>
            <p style={{ margin: 0, color: "var(--muted-text, #888)" }}>
              {displayDescription || "No description available for this video."}
            </p>
            {isLongDescription && (
              <button
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff0000",
                  fontWeight: "600",
                  padding: "4px 0 0 0",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "inline-block",
                  marginTop: "8px"
                }}
              >
                {descriptionExpanded ? "Show Less ──" : "Show More ──"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Related videos column ── */}
      <div style={{ flex: 1, minWidth: "260px" }}>
        <RelatedVideos videos={relatedVideos} />
      </div>
    </div>
  );
}

export default VideoPage;