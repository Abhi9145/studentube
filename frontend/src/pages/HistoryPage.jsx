import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProxiedThumbnail } from "../utils/thumbnail";

function HistoryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/api/videos/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "var(--faint-text)", textAlign: "center" }}>
        Loading your history…
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px" }}>
      {/* Header */}
      <div className="page-header">
        <h2>🕒 Watch History</h2>
        <span className="page-count">{videos.length} watched</span>
      </div>

      {/* Empty state */}
      {videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🕒</div>
          <h3>No watch history yet</h3>
          <p>Videos you watch will automatically appear here so you can pick up right where you left off.</p>
          <Link to="/" className="empty-state-btn">Start Watching</Link>
        </div>
      ) : (
        <div className="history-list">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/video/${video.videoId}`}
              className="history-item"
            >
              <img
                src={getProxiedThumbnail(video.thumbnail)}
                alt={video.title}
                className="history-thumb"
              />
              <div className="history-info">
                <div className="history-title">{video.title}</div>
                <div className="history-channel">{video.channel}</div>
                {video.updatedAt && (
                  <div className="history-date">
                    Watched {formatDate(video.updatedAt)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;