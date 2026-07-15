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
              src={
                video.snippet.thumbnails?.medium?.url ||
                video.snippet.thumbnails?.high?.url ||
                video.snippet.thumbnails?.default?.url
              }
              alt={video.snippet.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://i.ytimg.com/vi/${video.id.videoId}/mqdefault.jpg`;
              }}
            />

            <p>{video.snippet.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default RelatedVideos;