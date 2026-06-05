import { Link } from "react-router-dom";

function VideoCard({ video }) {
  const saveVideo = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/videos/save",
        {
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
        }
      );

      const data = await response.json();

      console.log(data);

      alert("Video Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save video");
    }
  };

  return (
    <div className="video-card">
      <Link
        to={`/video/${video.videoId}`}
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
        />

        <h4>{video.title}</h4>

        <p>{video.channel}</p>
      </Link>

      <button onClick={saveVideo}>
        💾 Save
      </button>
    </div>
  );
}

export default VideoCard;