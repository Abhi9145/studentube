
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function ContinueWatching() {
  const [history, setHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetchHistory();
    fetchPlaylists();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await fetch(
        "http://localhost:8000/api/videos/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setHistory(data.slice(0, 8));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:8000/api/playlists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setPlaylists(data);
    } catch (err) {
      console.log(err);
    }
  };

  const saveToPlaylist = async (playlistId, video) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `http://localhost:8000/api/playlists/${playlistId}/video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(video),
        }
      );

      toast.success("Added to Playlist");
    } catch {
      toast.error("Failed");
    }
  };

  if (history.length === 0) return null;

  return (
    <div className="resume-section">

      <div className="resume-header">

        <div>
          <h2>📚 Resume Learning</h2>
          <p>Pick up where you left off.</p>
        </div>

        <Link to="/history" className="view-all">
          View All →
        </Link>

      </div>

      <div className="resume-slider">

        {history.map((video) => (

          <div
            className="resume-card"
            key={video.videoId}
          >

            <Link
              to={`/video/${video.videoId}`}
            >

              <div className="thumbnail-wrapper">

                <img
                  src={video.thumbnail}
                  alt={video.title}
                />

                <div className="play-overlay">
                  ▶ Resume
                </div>

              </div>

            </Link>

            <div className="resume-info">

              <h4>{video.title}</h4>

              <p>{video.channel}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${30 + Math.random() * 60}%`,
                  }}
                />
              </div>

              <small>Continue Learning</small>

              {playlists.length > 0 && (

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      saveToPlaylist(
                        e.target.value,
                        video
                      );
                    }
                  }}
                >

                  <option>
                    ➕ Playlist
                  </option>

                  {playlists.map((playlist) => (

                    <option
                      key={playlist._id}
                      value={playlist._id}
                    >
                      {playlist.name}
                    </option>

                  ))}

                </select>

              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
export default ContinueWatching;

