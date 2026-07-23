import { API_URL } from "../config";
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import RelatedVideos from "../components/RelatedVideos";
import toast from "react-hot-toast";
import { getProxiedThumbnail } from "../utils/thumbnail";

/* ── Helpers ── */
const STORAGE_KEY = (id) => `yt_progress_${id}`;

/* ── Render AI notes with basic markdown formatting ── */
function NotesRenderer({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="ai-notes-body">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;
        if (/^#{1,3}\s/.test(trimmed)) {
          return (
            <h3 key={i} className="ai-notes-heading">
              {trimmed.replace(/^#{1,3}\s/, "")}
            </h3>
          );
        }
        if (/^\d+\.\s/.test(trimmed) && trimmed.length < 80) {
          return (
            <h3 key={i} className="ai-notes-heading">
              {trimmed}
            </h3>
          );
        }
        if (/^[-*•]\s/.test(trimmed)) {
          const content = trimmed.replace(/^[-*•]\s/, "");
          const parts = content.split(/\*\*(.*?)\*\*/g);
          return (
            <li key={i} className="ai-notes-bullet">
              {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
            </li>
          );
        }
        const boldParts = trimmed.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="ai-notes-para">
            {boldParts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
}

function VideoPage() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();

  const urlTime = parseInt(searchParams.get("t") || "0", 10);
  const storedTime = parseInt(localStorage.getItem(STORAGE_KEY(videoId)) || "0", 10);
  const resumeAt = urlTime > 0 ? urlTime : storedTime;

  const [videoMeta, setVideoMeta] = useState({ title: "", channel: "", description: "", thumbnail: "" });
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [iframeStarted, setIframeStarted] = useState(false);

  // ── AI Notes state ──────────────────────────────────────────────────────────
  const [notes, setNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const notesRef = useRef(null);

  const saveTimerRef = useRef(null);
  const watchedSecondsRef = useRef(resumeAt);

  const buildEmbedUrl = useCallback((startSec = 0) => {
    const base = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: "1", rel: "0", modestbranding: "1", enablejsapi: "1",
    });
    if (startSec > 0) params.set("start", String(Math.floor(startSec)));
    return `${base}?${params.toString()}`;
  }, [videoId]);

  const [embedUrl] = useState(() => buildEmbedUrl(resumeAt));

  const saveHistory = useCallback(async (secs) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (secs > 5) localStorage.setItem(STORAGE_KEY(videoId), String(Math.floor(secs)));
    try {
      await fetch(`${API_URL}/api/videos/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          videoId,
          title: videoMeta.title || `Video ${videoId}`,
          thumbnail: getProxiedThumbnail(videoMeta.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`),
          channel: videoMeta.channel || "YouTube",
          watchedSeconds: Math.floor(secs),
        }),
      });
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  }, [videoId, videoMeta]);

  useEffect(() => {
    if (!iframeStarted) return;
    let elapsed = watchedSecondsRef.current;
    const tick = setInterval(() => {
      elapsed += 1;
      watchedSecondsRef.current = elapsed;
      localStorage.setItem(STORAGE_KEY(videoId), String(Math.floor(elapsed)));
    }, 1000);
    saveTimerRef.current = setInterval(() => saveHistory(watchedSecondsRef.current), 15000);
    return () => {
      clearInterval(tick);
      clearInterval(saveTimerRef.current);
      saveHistory(watchedSecondsRef.current);
    };
  }, [iframeStarted, videoId, saveHistory]);

  useEffect(() => {
    saveHistory(resumeAt);

    fetch(`${API_URL}/api/videos/details/${videoId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setVideoMeta({
          title: data.title || "",
          channel: data.channel || "YouTube",
          description: data.description || "",
          thumbnail: getProxiedThumbnail(data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`),
        });

        // Search related videos using video title or fallback topic
        const query = data.title ? encodeURIComponent(data.title.slice(0, 40)) : "programming tutorial";
        fetch(`${API_URL}/api/videos/search?q=${query}`)
          .then((r) => r.json())
          .then((relData) => {
            const list = Array.isArray(relData) ? relData : relData.items || [];
            // Filter out current video
            const filtered = list.filter((v) => {
              const vId = v.id?.videoId || (typeof v.id === "string" ? v.id : v.videoId);
              return vId !== videoId;
            });
            setRelatedVideos(filtered.slice(0, 10));
          })
          .catch(console.error);
      })
      .catch(() => {
        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
          .then((r) => r.json())
          .then((d) => setVideoMeta({
            title: d.title || "", channel: d.author_name || "YouTube",
            description: "", thumbnail: getProxiedThumbnail(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`),
          }))
          .catch(() => setVideoMeta({ title: "", channel: "YouTube", description: "", thumbnail: getProxiedThumbnail(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`) }));

        fetch(`${API_URL}/api/videos/search?q=programming tutorial`)
          .then((r) => r.json())
          .then((relData) => setRelatedVideos(Array.isArray(relData) ? relData : relData.items || []))
          .catch(console.error);
      });

    watchedSecondsRef.current = resumeAt;
    setDescriptionExpanded(false);
    setNotes("");
    setNotesVisible(false);

    return () => clearInterval(saveTimerRef.current);
  }, [videoId]);

  const handleIframeLoad = () => setIframeStarted(true);

  // ── AI Notes generation ─────────────────────────────────────────────────────
  const generateNotes = async () => {
    const title = videoMeta.title;
    if (!title) {
      toast.error("Video title not loaded yet. Please wait a moment.");
      return;
    }
    setNotesLoading(true);
    setNotesVisible(true);
    setTimeout(() => notesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);

    try {
      const res = await fetch(`${API_URL}/api/ai/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (res.status === 429) {
        toast.error("⏳ AI quota exceeded. Please try again in a few minutes.");
        setNotesVisible(false);
        return;
      }
      if (!res.ok) throw new Error(data.message || "Failed");
      setNotes(data.notes);
    } catch (err) {
      toast.error("Failed to generate notes. Please try again.");
      setNotesVisible(false);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes).then(() => toast.success("Notes copied to clipboard!"));
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([notes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(videoMeta.title || "notes").slice(0, 40).replace(/[^a-z0-9]/gi, "_")}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerateNotes = () => { setNotes(""); generateNotes(); };

  // ── Render ─────────────────────────────────────────────────────────────────
  const descriptionText = videoMeta.description || "";
  const isLongDescription = descriptionText.length > 200;
  const displayDescription = descriptionExpanded || !isLongDescription
    ? descriptionText
    : `${descriptionText.slice(0, 200)}...`;

  return (
    <div className="video-page-layout">

      {/* ── Main player column ── */}
      <div style={{ flex: 3, minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* iframe */}
        <div style={{
          borderRadius: "14px", overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,.6)", aspectRatio: "16/9", background: "#000",
        }}>
          <iframe
            key={embedUrl} width="100%" height="100%" src={embedUrl}
            title="YouTube Video Player" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen onLoad={handleIframeLoad} style={{ display: "block" }}
          />
        </div>

        {/* Video Title & Meta Card */}
        <div className="video-details-card" style={{
          background: "var(--card-bg, #181818)", borderRadius: "16px", padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)", border: "1px solid var(--border-color, #222)",
        }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-color, #fff)", margin: "0 0 16px 0", lineHeight: "1.4" }}>
            {videoMeta.title || "Loading video title..."}
          </h1>

          {/* Channel Row */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border-color, #222)"
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "linear-gradient(135deg, #ff0000 0%, #b30000 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "bold", color: "#fff", fontSize: "18px", textTransform: "uppercase"
            }}>
              {videoMeta.channel ? videoMeta.channel.charAt(0) : "Y"}
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "16px", color: "var(--text-color, #fff)" }}>
                {videoMeta.channel || "YouTube Channel"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted-text, #888)", marginTop: "2px" }}>
                Verified Creator
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{
            background: "var(--secondary-bg, #161616)", borderRadius: "12px", padding: "16px",
            fontSize: "14px", lineHeight: "1.6", color: "var(--text-color, #ccc)",
            whiteSpace: "pre-wrap", wordBreak: "break-word", border: "1px solid var(--border-color, #222)"
          }}>
            <strong style={{ display: "block", marginBottom: "8px", color: "var(--text-color, #fff)" }}>
              Description
            </strong>
            <p style={{ margin: 0, color: "var(--muted-text, #888)" }}>
              {displayDescription || "No description available for this video."}
            </p>
            {isLongDescription && (
              <button onClick={() => setDescriptionExpanded(!descriptionExpanded)} style={{
                background: "none", border: "none", color: "#ff0000", fontWeight: "600",
                padding: "4px 0 0 0", cursor: "pointer", fontSize: "13px", display: "inline-block", marginTop: "8px"
              }}>
                {descriptionExpanded ? "Show Less ──" : "Show More ──"}
              </button>
            )}
          </div>

          {/* ── Generate AI Notes Button ── */}
          {!notesVisible && (
            <button
              className="ai-notes-trigger-btn"
              onClick={generateNotes}
              disabled={!videoMeta.title}
            >
              <span className="ai-notes-trigger-icon">✨</span>
              Generate AI Study Notes
              <span className="ai-notes-trigger-badge">Gemini</span>
            </button>
          )}
        </div>

        {/* ── AI Notes Panel ── */}
        {notesVisible && (
          <div className="ai-notes-panel" ref={notesRef}>

            {/* Panel Header */}
            <div className="ai-notes-header">
              <div className="ai-notes-header-left">
                <div className="ai-notes-gem-icon">✨</div>
                <div>
                  <div className="ai-notes-title">AI Study Notes</div>
                  <div className="ai-notes-subtitle">
                    {notesLoading
                      ? "Generating with Gemini AI…"
                      : `"${(videoMeta.title || "").slice(0, 55)}${(videoMeta.title || "").length > 55 ? "…" : ""}"`}
                  </div>
                </div>
              </div>

              {!notesLoading && notes && (
                <div className="ai-notes-actions">
                  <button className="ai-notes-action-btn" onClick={handleCopyNotes}>
                    📋 Copy
                  </button>
                  <button className="ai-notes-action-btn" onClick={handleDownloadNotes}>
                    ⬇️ Save
                  </button>
                  <button className="ai-notes-action-btn ai-notes-regen-btn" onClick={handleRegenerateNotes}>
                    🔄 Regenerate
                  </button>
                  <button
                    className="ai-notes-action-btn ai-notes-close-btn"
                    onClick={() => { setNotesVisible(false); setNotes(""); }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Loading state */}
            {notesLoading && (
              <div className="ai-notes-loading">
                <div className="ai-notes-spinner-wrap">
                  <div className="ai-notes-spinner" />
                  <span>Gemini is thinking…</span>
                </div>
                <div className="ai-notes-skeleton">
                  {[90, 70, 85, 60, 80, 65, 95, 50].map((w, i) => (
                    <div key={i} className="ai-notes-skeleton-line" style={{ width: `${w}%`, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Notes content */}
            {!notesLoading && notes && <NotesRenderer text={notes} />}
          </div>
        )}
      </div>

      {/* ── Related videos column ── */}
      <div style={{ flex: 1, minWidth: "240px" }}>
        <RelatedVideos videos={relatedVideos} />
      </div>
    </div>
  );
}

export default VideoPage;