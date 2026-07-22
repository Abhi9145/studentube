const FALLBACK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%23222'/%3E%3Ctext x='160' y='98' text-anchor='middle' fill='%23555' font-family='sans-serif' font-size='14'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";

export const getProxiedThumbnail = (url) => {
  if (!url) return FALLBACK_SVG;

  let cleanUrl = url;
  if (typeof cleanUrl === "string" && cleanUrl.startsWith("//")) {
    cleanUrl = "https:" + cleanUrl;
  }

  // If already proxied by wsrv.nl, return as is
  if (typeof cleanUrl === "string" && cleanUrl.includes("wsrv.nl")) {
    return cleanUrl;
  }

  // Route YouTube CDN images through Cloudflare-backed wsrv.nl image proxy.
  // This bypasses ERR_CERT_AUTHORITY_INVALID SSL errors completely on all networks.
  if (typeof cleanUrl === "string" && (cleanUrl.includes("ytimg.com") || cleanUrl.includes("ggpht.com") || cleanUrl.includes("youtube.com"))) {
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
  }

  return cleanUrl;
};
