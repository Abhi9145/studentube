import { Link } from "react-router-dom";

function RelatedVideos({ videos }) {
  return (
    <div className="related-videos">
      <h3>Related Videos</h3>

      {videos.map((video) => (
        <Link
          key={video.id.videoId}
          to={`/video/${video.id.videoId}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div className="related-card">
            <img
              src={video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url || ""}
              alt={video.snippet?.title || ""}
              onError={(e) => {
                const videoId = video.id?.videoId;
                if (!videoId) { e.currentTarget.onerror = null; return; }
                const current = e.currentTarget.src;
                if (current.includes("mqdefault")) {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                } else if (current.includes("hqdefault")) {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
                } else if (current.includes("sddefault")) {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
                } else {
                  e.currentTarget.onerror = null;
                }
              }}
            />

            <p>{video.snippet?.title || ""}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default RelatedVideos;