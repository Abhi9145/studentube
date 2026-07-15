import { API_URL } from "../config";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`${API_URL}/api/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const found = data.find((p) => p._id === playlistId);
      setPlaylist(found || null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  const removeVideo = async (videoId) => {
    try {
      await fetch(`${API_URL}/api/playlists/${playlistId}/video/${videoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPlaylist();
      toast.success("Video removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove video");
    }
  };

  const deletePlaylist = async () => {
    if (!window.confirm("Delete this playlist? This cannot be undone.")) return;
    try {
      await fetch(`${API_URL}/api/playlists/${playlistId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Playlist deleted");
      navigate("/playlists");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete playlist");
    }
  };

  useEffect(() => { fetchPlaylist(); }, [playlistId]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--faint-text)" }}>
        Loading playlist…
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="empty-state" style={{ margin: "40px 20px" }}>
        <div className="empty-state-icon">🔍</div>
        <h3>Playlist not found</h3>
        <p>This playlist may have been deleted.</p>
        <Link to="/playlists" className="empty-state-btn">← Back to Playlists</Link>
      </div>
    );
  }

  const cover = playlist.videos?.[0]?.thumbnail;

  return (
    <div style={{ padding: "24px 20px", maxWidth: "860px" }}>

      {/* ── Back link ── */}
      <Link
        to="/playlists"
        style={{ fontSize: "13px", color: "var(--muted-text)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-color)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-text)")}
      >
        ← All Playlists
      </Link>

      {/* ── Hero header ── */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          background: "var(--card-bg)",
          border: "1px solid var(--faint-border)",
          borderRadius: "18px",
          padding: "24px",
          marginBottom: "28px",
        }}
      >
        {/* Cover image / placeholder */}
        <div
          style={{
            width: "160px",
            height: "108px",
            borderRadius: "12px",
            overflow: "hidden",
            flexShrink: 0,
            background: "var(--secondary-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "44px",
          }}
        >
          {cover ? (
            <img src={cover} alt={playlist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            "📁"
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "12px", color: "var(--faint-text)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            Playlist
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "8px", lineHeight: 1.3 }}>
            {playlist.name}
          </h1>
          <p style={{ color: "var(--muted-text)", fontSize: "14px", marginBottom: "20px" }}>
            {playlist.videos?.length || 0} {playlist.videos?.length === 1 ? "video" : "videos"}
          </p>
          <button
            onClick={deletePlaylist}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,60,60,.25)",
              background: "rgba(255,60,60,.07)",
              color: "#ff5555",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: ".2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,60,60,.18)";
              e.currentTarget.style.borderColor = "rgba(255,60,60,.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,60,60,.07)";
              e.currentTarget.style.borderColor = "rgba(255,60,60,.25)";
            }}
          >
            🗑 Delete Playlist
          </button>
        </div>
      </div>

      {/* ── Video list ── */}
      {!playlist.videos || playlist.videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎬</div>
          <h3>No videos yet</h3>
          <p>Add videos from the homepage or while watching any educational video.</p>
          <Link to="/" className="empty-state-btn">Browse Videos</Link>
        </div>
      ) : (
        <div className="history-list">
          {playlist.videos.map((video, idx) => (
            <div
              key={video.videoId}
              style={{
                display: "flex",
                gap: "16px",
                background: "var(--card-bg)",
                border: "1px solid var(--faint-border)",
                borderRadius: "14px",
                overflow: "hidden",
                alignItems: "center",
                transition: ".2s",
                padding: "0 16px 0 0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--card-border)";
                e.currentTarget.style.background = "var(--secondary-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--faint-border)";
                e.currentTarget.style.background = "var(--card-bg)";
              }}
            >
              {/* Index */}
              <span
                style={{
                  minWidth: "36px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "var(--faint-text)",
                  fontWeight: "600",
                  paddingLeft: "16px",
                }}
              >
                {idx + 1}
              </span>

              {/* Thumbnail */}
              <Link to={`/video/${video.videoId}`} style={{ flexShrink: 0 }}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="history-thumb"
                  style={{ width: "180px", height: "101px" }}
                  onError={(e) => {
                    const id = video.videoId;
                    if (!id) { e.currentTarget.onerror = null; return; }
                    const cur = e.currentTarget.src;
                    if (cur.includes("hqdefault")) e.currentTarget.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
                    else if (cur.includes("mqdefault")) e.currentTarget.src = `https://i.ytimg.com/vi/${id}/sddefault.jpg`;
                    else if (cur.includes("sddefault")) e.currentTarget.src = `https://i.ytimg.com/vi/${id}/default.jpg`;
                    else e.currentTarget.onerror = null;
                  }}
                />
              </Link>

              {/* Info */}
              <div className="history-info" style={{ flex: 1 }}>
                <Link to={`/video/${video.videoId}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="history-title">{video.title}</div>
                </Link>
                <div className="history-channel">{video.channel}</div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeVideo(video.videoId)}
                title="Remove from playlist"
                style={{
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  color: "var(--faint-text)",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  transition: ".2s",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ff5555";
                  e.currentTarget.style.background = "rgba(255,60,60,.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--faint-text)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistDetailPage;