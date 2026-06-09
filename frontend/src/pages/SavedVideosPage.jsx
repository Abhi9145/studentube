import { useEffect, useState } from "react";

function SavedVideosPage() {
  const [videos, setVideos] = useState([]);

  const fetchVideos = () => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/videos/saved", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const deleteVideo = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8000/api/videos/saved/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      alert(data.message);

      fetchVideos();
    } catch (error) {
      console.error(error);
      alert("Failed to delete video");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📌 Saved Videos</h2>

      {videos.map((video) => (
        <div
          key={video._id}
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            alignItems: "center",
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

            <button
              onClick={() => deleteVideo(video._id)}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SavedVideosPage;