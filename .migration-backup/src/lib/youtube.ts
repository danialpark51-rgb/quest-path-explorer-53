export const extractYouTubeVideoId = (url: string) => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }

    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1]?.split("/")[0] || null;
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
};

export const getYouTubeEmbedUrl = (url: string) => {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : null;
};

export const getYouTubeThumbnailUrl = (url: string) => {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "/placeholder.svg";
};

export const getYouTubeSearchUrl = (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;