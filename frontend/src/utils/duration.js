export const parseIsoDuration = (isoDuration) => {
  if (!isoDuration) return null;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return isoDuration;
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  const paddedSeconds = seconds.toString().padStart(2, "0");
  if (hours > 0) {
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
};

export const getOrGenerateDuration = (video) => {
  if (!video) return "15:00";

  if (video.duration && typeof video.duration === "string" && video.duration.trim().length > 0) {
    return video.duration.trim();
  }
  if (video.contentDetails?.duration) {
    return parseIsoDuration(video.contentDetails.duration);
  }
  if (video.snippet?.duration) {
    return parseIsoDuration(video.snippet.duration);
  }

  // Generate realistic duration from video ID/title hash
  const id = video.id?.videoId || video.videoId || video.id || video.title || "default";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const minutes = 8 + (absHash % 42); // 8m to 50m
  const seconds = ((absHash * 13) % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const getOrGenerateUploadTime = (video) => {
  if (!video) return "1 month ago";

  const rawDate = video.publishedAt || video.snippet?.publishedAt || video.uploadDate;
  if (rawDate) {
    const published = new Date(rawDate);
    const now = new Date();
    const diffMs = now - published;
    if (!isNaN(diffMs) && diffMs > 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      if (diffMins < 60) return `${Math.max(1, diffMins)} minutes ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
      }
      if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
      return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
    }
  }

  // Deterministic realistic fallback from video ID/title hash
  const id = video.id?.videoId || video.videoId || video.id || video.title || "default";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const options = [
    "2 weeks ago",
    "1 month ago",
    "3 months ago",
    "5 months ago",
    "8 months ago",
    "1 year ago",
    "2 years ago",
    "3 years ago"
  ];
  return options[absHash % options.length];
};
