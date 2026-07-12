import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import RelatedVideos from "../components/RelatedVideos";

function VideoPage() {
  const { videoId } = useParams();

  const [relatedVideos, setRelatedVideos] = useState([]);

  useEffect(() => {
    const saveHistory = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        await fetch(
          "http://localhost:8000/api/videos/history",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              videoId,
              title: "YouTube Video",
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              channel: "YouTube",
            }),
          }
        );
      } catch (error) {
        console.error(error);
      }
    };

    saveHistory();

    fetch(
      "http://localhost:8000/api/videos/search?q=programming"
    )
      .then((res) => res.json())
      .then((data) => {
        setRelatedVideos(data);
      })
      .catch(console.error);
  }, [videoId]);

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
      }}
    >
      <div style={{ flex: 3 }}>
        <iframe
          width="100%"
          height="600"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube Video Player"
          frameBorder="0"
          allowFullScreen
        />
      </div>

      <div style={{ flex: 1 }}>
        <RelatedVideos
          videos={relatedVideos}
        />
      </div>
    </div>
  );
}

export default VideoPage;