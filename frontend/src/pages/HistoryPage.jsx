import { useEffect, useState } from "react";

function HistoryPage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/videos/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Watch History</h2>

      {videos.map((video) => (
        <div
          key={video._id}
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            width="200"
          />

          <div>
            <h3>{video.title}</h3>
            <p>{video.channel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HistoryPage;