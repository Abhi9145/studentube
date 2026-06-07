import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";

function SavedVideosPage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/videos/saved", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📌 Saved Videos</h2>

      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={{
              title: video.title,
              channel: video.channel,
              thumbnail: video.thumbnail,
              videoId: video.videoId,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SavedVideosPage;