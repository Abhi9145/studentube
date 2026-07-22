import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getProxiedThumbnail } from "../utils/thumbnail";

function SavedVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVideos = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    try {
      const res = await fetch(`${API_URL}/api/videos/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const deleteVideo = async (id) => {
    const token = localStorage.getItem("token");
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/videos/saved/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "var(--faint-text)", textAlign: "center" }}>
        Loading your library…
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px" }}>
      {/* Header */}
      <div className="page-header">
        <h2>📌 Saved Videos</h2>
        <span className="page-count">{videos.length} saved</span>
      </div>

      {/* Empty state */}
      {videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💾</div>
          <h3>Nothing saved yet</h3>
          <p>Bookmark educational videos to find them here anytime. Start exploring below.</p>
          <Link to="/" className="empty-state-btn">Explore Videos</Link>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video._id} className="video-card" style={{ display: "flex", flexDirection: "column" }}>
              {/* Thumbnail */}
              <Link to={`/video/${video.videoId}`}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <img src={getProxiedThumbnail(video.thumbnail)} alt={video.title} style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }} />
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: ".25s", fontSize: "28px",
                  }}
                    className="play-hover-overlay"
                  >▶</div>
                </div>
              </Link>

              {/* Info */}
              <div style={{ padding: "12px 12px 8px", flex: 1 }}>
                <Link to={`/video/${video.videoId}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h4 style={{
                    fontSize: "14px", fontWeight: "600", lineHeight: 1.4, marginBottom: "6px",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {video.title}
                  </h4>
                </Link>
                <p style={{ fontSize: "12px", color: "#ff0000", fontWeight: 500, margin: 0 }}>
                  {video.channel}
                </p>
              </div>

              {/* Actions */}
              <div className="saved-card-actions">
                <button
                  className="btn-delete"
                  disabled={deletingId === video._id}
                  onClick={() => deleteVideo(video._id)}
                >
                  🗑 {deletingId === video._id ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedVideosPage;