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
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
            />

            <p>{video.snippet.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default RelatedVideos;