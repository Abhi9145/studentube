import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_KEY = (id) => `yt_progress_${id}`;

function ContinueWatching() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/videos/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data.slice(0, 6) : [];
        setHistory(items);
      })
      .catch(console.error);
  }, []);

  if (history.length === 0) return null;

  // Best timestamp: backend watchedSeconds OR localStorage (whichever is larger)
  const getResumeSeconds = (v) => {
    const backend = v.watchedSeconds || 0;
    const local = parseInt(localStorage.getItem(STORAGE_KEY(v.videoId)) || "0", 10);
    return Math.max(backend, local);
  };

  // Build URL with ?t= so VideoPage auto-resumes
  const resumeUrl = (v) => {
    const secs = getResumeSeconds(v);
    return `/video/${v.videoId}${secs > 5 ? `?t=${secs}` : ""}`;
  };

  const formatTime = (secs) => {
    if (!secs || secs < 1) return null;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Progress bar width (treat 20 min as 100%)
  const progressPct = (v) => {
    const secs = getResumeSeconds(v);
    return Math.min(Math.round((secs / 1200) * 100), 96);
  };

  return (
    <section className="cw-section">
      {/* Header */}
      <div className="cw-header">
        <div className="cw-header-left">
          <span className="cw-dot" />
          <h3 className="cw-title">Continue Watching</h3>
          <span className="cw-count">{history.length}</span>
        </div>
        <Link to="/history" className="cw-view-all">
          View all →
        </Link>
      </div>

      {/* Horizontal strip */}
      <div className="cw-strip">
        {history.map((video) => {
          const resumeSecs = getResumeSeconds(video);
          const pct = progressPct(video);
          const timeLabel = formatTime(resumeSecs);

          return (
            <div
              key={video.videoId}
              className="cw-card"
              onClick={() => navigate(resumeUrl(video))}
              title={timeLabel ? `Resume at ${timeLabel}` : "Watch"}
            >
              {/* Thumbnail */}
              <div className="cw-thumb-wrap">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="cw-thumb"
                />

                {/* Hover overlay */}
                <div className="cw-overlay">
                  <span className="cw-play-icon">▶</span>
                  {timeLabel && (
                    <span className="cw-time-badge">{timeLabel}</span>
                  )}
                </div>

                {/* Progress bar — always shown; 0% if no timestamp yet */}
                <div className="cw-progress-bar">
                  <div
                    className="cw-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="cw-info">
                <p className="cw-video-title">{video.title}</p>
                <p className="cw-video-channel">{video.channel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ContinueWatching;
