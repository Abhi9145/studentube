import { Link } from "react-router-dom";
import { getProxiedThumbnail } from "../utils/thumbnail";
import { getOrGenerateDuration } from "../utils/duration";

function RelatedVideos({ videos }) {
  return (
    <div className="related-videos">
      <h3>Related Videos</h3>

      {videos.map((video, idx) => {
        const vId = video.id?.videoId || (typeof video.id === "string" ? video.id : video.videoId);
        const vTitle = video.snippet?.title || video.title || "Educational Video";
        const rawThumb = video.snippet?.thumbnails?.medium?.url ||
                         video.snippet?.thumbnails?.high?.url ||
                         video.snippet?.thumbnails?.default?.url ||
                         video.thumbnail;
        const vThumb = rawThumb || (vId ? `https://i.ytimg.com/vi/${vId}/hqdefault.jpg` : null);
        const duration = getOrGenerateDuration(video);

        return (
          <Link
            key={vId ? `${vId}-${idx}` : idx}
            to={`/video/${vId}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="related-card" style={{ position: "relative" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={getProxiedThumbnail(vThumb)}
                  alt={vTitle}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%23222'/%3E%3Ctext x='160' y='98' text-anchor='middle' fill='%23555' font-family='sans-serif' font-size='14'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
                  }}
                />
                {duration && (
                  <span className="video-duration-badge" style={{ bottom: "6px", right: "6px", fontSize: "10px", padding: "2px 5px" }}>
                    {duration}
                  </span>
                )}
              </div>

              <p>{vTitle}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default RelatedVideos;