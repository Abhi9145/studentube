import { useState, useRef, useEffect } from "react";
import { API_URL } from "../config";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getProxiedThumbnail } from "../utils/thumbnail";
import { getOrGenerateDuration, getOrGenerateUploadTime } from "../utils/duration";

function VideoCard({ video }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  // Hover video preview state & refs
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");
  const videoDuration = getOrGenerateDuration(video);
  const uploadTime = getOrGenerateUploadTime(video);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    // 350ms hover delay before triggering video preview
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveVideo = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to save videos");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/videos/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.thumbnail,
          channel: video.channel,
        }),
      });

      if (response.ok) {
        toast.success("Video Saved!");
      } else {
        const data = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(data.message || "Failed to save video");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save video. Try again.");
    }
  };

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
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
      setLoadingPlaylists(false);
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to add to playlist");
      return;
    }
    const nextState = !showDropdown;
    setShowDropdown(nextState);
    if (nextState) {
      fetchPlaylists();
    }
  };

  const addToPlaylist = async (playlistId, playlistName) => {
    try {
      const response = await fetch(`${API_URL}/api/playlists/${playlistId}/video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.thumbnail,
          channel: video.channel,
        }),
      });

      if (response.ok) {
        toast.success(`Added to ${playlistName}!`);
        setShowDropdown(false);
      } else {
        const data = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(data.message || "Failed to add video");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add video to playlist.");
    }
  };

  const createAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setCreatingPlaylist(true);
    try {
      const createRes = await fetch(`${API_URL}/api/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newPlaylistName.trim() }),
      });
      const newPlaylist = await createRes.json();
      
      if (createRes.ok && newPlaylist._id) {
        toast.success(`Playlist "${newPlaylistName}" created!`);
        setNewPlaylistName("");
        // Add video to this new playlist
        await addToPlaylist(newPlaylist._id, newPlaylistName);
      } else {
        toast.error(newPlaylist.message || "Failed to create playlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating playlist");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <div className="video-card">
      <Link to={`/video/${video.videoId}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div
          className="thumbnail-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ position: "relative", overflow: "hidden" }}
        >
          <img
            src={getProxiedThumbnail(video.thumbnail)}
            alt={video.title}
            style={{
              opacity: isHovered ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%23222'/%3E%3Ctext x='160' y='98' text-anchor='middle' fill='%23555' font-family='sans-serif' font-size='14'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
            }}
          />

          {isHovered && video.videoId && (
            <div className="hover-preview-container">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${video.videoId}&enablejsapi=1&playsinline=1`}
                title={video.title}
                allow="autoplay; encrypted-media"
                className="hover-preview-iframe"
              />
              <div className="hover-preview-badge">
                <span className="pulse-dot" />
                Previewing
              </div>
            </div>
          )}

          {videoDuration && !isHovered && (
            <span className="video-duration-badge">
              {videoDuration}
            </span>
          )}
        </div>
        <h4>{video.title}</h4>
        <p className="video-card-meta">
          <span className="video-card-channel">{video.channel}</span>
          <span className="video-card-dot">•</span>
          <span className="video-card-time">{uploadTime}</span>
        </p>
      </Link>

      <div style={{ display: "flex", gap: "8px", padding: "0 12px 14px" }}>
        <button onClick={saveVideo} style={{ flex: 1 }}>
          Save
        </button>

        {/* Playlist relative wrapper */}
        <div style={{ position: "relative", flex: 1 }} ref={dropdownRef}>
          <button onClick={toggleDropdown} style={{ width: "100%" }}>
            Playlist
          </button>

          {showDropdown && (
            <div className="card-playlist-dropdown">
              <div className="dropdown-header">Add to Playlist</div>
              
              <div className="dropdown-body">
                {loadingPlaylists ? (
                  <div className="dropdown-loading">Loading...</div>
                ) : playlists.length === 0 ? (
                  <div className="dropdown-empty">No playlists found</div>
                ) : (
                  playlists.map(pl => (
                    <button
                      key={pl._id}
                      className="dropdown-item-btn"
                      onClick={() => addToPlaylist(pl._id, pl.name)}
                    >
                      {pl.name}
                    </button>
                  ))
                )}
              </div>

              <div className="dropdown-divider" />

              {/* Quick create option */}
              <form onSubmit={createAndAdd} className="dropdown-footer-form">
                <input
                  type="text"
                  placeholder="New playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  disabled={creatingPlaylist}
                />
                <button type="submit" disabled={creatingPlaylist || !newPlaylistName.trim()}>
                  Create
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoCard;