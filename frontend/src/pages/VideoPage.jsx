import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import RelatedVideos from "../components/RelatedVideos";

function VideoPage() {
  const { videoId } = useParams();

  const [relatedVideos, setRelatedVideos] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const addToHistory = async (video) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      await fetch(
        "http://localhost:8000/api/videos/history",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(video),
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/videos/search?q=programming")
      .then((res) => res.json())
      .then((data) => {
        setRelatedVideos(data);

        const currentVideo = data.find(
          (video) => video.id?.videoId === videoId
        );

        if (currentVideo) {
          addToHistory({
            videoId: currentVideo.id.videoId,
            title: currentVideo.snippet.title,
            thumbnail:
              currentVideo.snippet.thumbnails.high.url,
            channel:
              currentVideo.snippet.channelTitle,
          });
        }
      })
      .catch((err) => console.error(err));
  }, [videoId]);

  const generateNotes = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/ai/notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Programming Tutorial",
          }),
        }
      );

      const data = await response.json();

      setNotes(data.notes);
      setShowNotes(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate notes");
    } finally {
      setLoading(false);
    }
  };

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
        ></iframe>

        <button
          onClick={generateNotes}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "📝 Generate Notes"}
        </button>

        {showNotes && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              border: "1px solid gray",
              borderRadius: "10px",
              whiteSpace: "pre-wrap",
            }}
          >
            <h3>📚 AI Generated Notes</h3>
            {notes}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <RelatedVideos videos={relatedVideos} />
      </div>
    </div>
  );
}

export default VideoPage;