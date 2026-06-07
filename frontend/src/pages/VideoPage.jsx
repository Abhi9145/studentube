import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import RelatedVideos from "../components/RelatedVideos";

function VideoPage() {
  const { videoId } = useParams();

  const [relatedVideos, setRelatedVideos] = useState([]);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
     fetch("http://localhost:8000/api/videos/search?q=programming")      .then((res) => res.json())
      .then((data) => setRelatedVideos(data))
      .catch((err) => console.error(err));
  }, []);

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
          onClick={() => setShowNotes(!showNotes)}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          📝 Generate Notes
        </button>

        {showNotes && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              border: "1px solid gray",
              borderRadius: "10px",
            }}
          >
            <h3>Video Notes</h3>

            <ul>
              <li>Main concepts explained</li>
              <li>Important examples discussed</li>
              <li>Practical implementation tips</li>
              <li>Summary of the lesson</li>
            </ul>
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