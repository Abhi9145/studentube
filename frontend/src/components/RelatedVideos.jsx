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
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%23222'/%3E%3Ctext x='160' y='98' text-anchor='middle' fill='%23555' font-family='sans-serif' font-size='14'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
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