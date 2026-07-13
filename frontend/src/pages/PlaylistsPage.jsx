import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

/* ── Emoji set for auto-generated playlist covers ── */
const PLAYLIST_EMOJIS = ["📘", "📗", "📙", "📕", "🎯", "🚀", "⚡", "🔬", "🧮", "🖥️", "🤖", "🎓"];
const getEmoji = (id) => PLAYLIST_EMOJIS[id.charCodeAt(id.length - 1) % PLAYLIST_EMOJIS.length];

function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  /* Inline rename state: { [playlistId]: string } */
  const [renameMap, setRenameMap] = useState({});
  const [renamingId, setRenamingId] = useState(null);

  /* Which playlist is expanded to show its videos */
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem("token");

  // ── API Helpers ───────────────────────────────────────────────────────────
  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${API_URL}/api/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }
    setCreating(true);
    try {
      await fetch(`${API_URL}/api/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      await fetchPlaylists();
      toast.success("Playlist created! 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const renamePlaylist = async (playlistId) => {
    const newName = renameMap[playlistId]?.trim();
    if (!newName) {
      toast.error("Please enter a name");
      return;
    }
    try {
      await fetch(`${API_URL}/api/playlists/${playlistId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      setRenamingId(null);
      await fetchPlaylists();
      toast.success("Playlist renamed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename playlist");
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm("Delete this playlist? This cannot be undone.")) return;
    try {
      await fetch(`${API_URL}/api/playlists/${playlistId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPlaylists();
      toast.success("Playlist deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete playlist");
    }
  };

  const removeVideo = async (playlistId, videoId) => {
    try {
      await fetch(`${API_URL}/api/playlists/${playlistId}/video/${videoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPlaylists();
      toast.success("Video removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove video");
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="playlists-page">

      {/* ── Header ── */}
      <div className="page-header">
        <h2>📁 My Playlists</h2>
        <span className="page-count">{playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}</span>
      </div>

      {/* ── Create form ── */}
      <form onSubmit={createPlaylist} className="create-playlist-form">
        <input
          type="text"
          placeholder="New playlist name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="create-playlist-input"
          maxLength={60}
        />
        <button type="submit" className="create-playlist-btn" disabled={creating}>
          {creating ? "Creating…" : "+ Create Playlist"}
        </button>
      </form>

      {/* ── Loading ── */}
      {loading && (
        <div className="playlist-loading">
          <div className="playlist-spinner" />
          Loading playlists…
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && playlists.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No playlists yet</h3>
          <p>Create your first playlist to organise the videos you love learning from.</p>
        </div>
      )}

      {/* ── Playlist cards ── */}
      {!loading && playlists.length > 0 && (
        <div className="playlist-grid">
          {playlists.map((playlist) => {
            const isExpanded = expandedId === playlist._id;
            const isRenaming = renamingId === playlist._id;
            const cover = playlist.videos?.[0]?.thumbnail;
            const emoji = getEmoji(playlist._id);

            return (
              <div key={playlist._id} className="playlist-card">

                {/* ── Thumbnail strip ── */}
                <Link to={`/playlists/${playlist._id}`} className="playlist-cover">
                  {cover ? (
                    <img src={cover} alt={playlist.name} className="playlist-cover-img" />
                  ) : (
                    <div className="playlist-cover-placeholder">{emoji}</div>
                  )}
                  <div className="playlist-cover-badge">
                    {playlist.videos?.length || 0} videos
                  </div>
                </Link>

                {/* ── Info section ── */}
                <div className="playlist-info">
                  {isRenaming ? (
                    <div className="playlist-rename-row">
                      <input
                        autoFocus
                        className="playlist-rename-input"
                        value={renameMap[playlist._id] ?? playlist.name}
                        onChange={(e) =>
                          setRenameMap((prev) => ({ ...prev, [playlist._id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renamePlaylist(playlist._id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        maxLength={60}
                      />
                      <button className="pl-btn-save" onClick={() => renamePlaylist(playlist._id)}>Save</button>
                      <button className="pl-btn-cancel" onClick={() => setRenamingId(null)}>✕</button>
                    </div>
                  ) : (
                    <Link to={`/playlists/${playlist._id}`} className="playlist-name-link">
                      <h3 className="playlist-name">{playlist.name}</h3>
                    </Link>
                  )}

                  <p className="playlist-meta">
                    {playlist.videos?.length || 0} {playlist.videos?.length === 1 ? "video" : "videos"}
                  </p>

                  {/* ── Action buttons ── */}
                  <div className="playlist-actions">
                    <button
                      className="pl-btn pl-btn-rename"
                      onClick={() => {
                        setRenamingId(isRenaming ? null : playlist._id);
                        setRenameMap((prev) => ({ ...prev, [playlist._id]: playlist.name }));
                      }}
                    >
                      ✏️ Rename
                    </button>
                    <button
                      className="pl-btn pl-btn-expand"
                      onClick={() => setExpandedId(isExpanded ? null : playlist._id)}
                    >
                      {isExpanded ? "▲ Hide" : "▼ Videos"}
                    </button>
                    <button
                      className="pl-btn pl-btn-delete"
                      onClick={() => deletePlaylist(playlist._id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {/* ── Expanded video list ── */}
                {isExpanded && playlist.videos?.length > 0 && (
                  <div className="playlist-video-list">
                    {playlist.videos.map((video, idx) => (
                      <div key={video.videoId} className="playlist-video-item">
                        <span className="pl-video-idx">{idx + 1}</span>
                        <Link to={`/video/${video.videoId}`}>
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="pl-video-thumb"
                          />
                        </Link>
                        <div className="pl-video-info">
                          <Link to={`/video/${video.videoId}`} className="pl-video-title">
                            {video.title}
                          </Link>
                          <p className="pl-video-channel">{video.channel}</p>
                        </div>
                        <button
                          className="pl-video-remove"
                          onClick={() => removeVideo(playlist._id, video.videoId)}
                          title="Remove from playlist"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && (!playlist.videos || playlist.videos.length === 0) && (
                  <div className="playlist-video-list" style={{ textAlign: "center", color: "#555", padding: "20px" }}>
                    No videos in this playlist yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlaylistsPage;