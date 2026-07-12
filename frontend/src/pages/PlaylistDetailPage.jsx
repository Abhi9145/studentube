import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

function PlaylistDetailPage() {
  const { playlistId } = useParams();

  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  const fetchPlaylist = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8000/api/playlists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      const currentPlaylist = data.find(
        (p) => p._id === playlistId
      );

      setPlaylist(currentPlaylist);
    } catch (error) {
      console.error(error);
    }
  };

  if (!playlist) {
    return <h2>Loading...</h2>;
  }

  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <h1>📁 {playlist.name}</h1>

      <p>
        Total Videos:
        {" "}
        {playlist.videos.length}
      </p>

      <hr />

      {playlist.videos.map((video) => (
        <Link
          key={video.videoId}
          to={`/video/${video.videoId}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "20px",
              border: "1px solid #333",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              width="220"
            />

            <div>
              <h3>{video.title}</h3>
              <p>{video.channel}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default PlaylistDetailPage;