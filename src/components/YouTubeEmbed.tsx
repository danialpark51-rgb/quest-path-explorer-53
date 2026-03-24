import { ExternalLink, PlayCircle } from "lucide-react";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";

type YouTubeEmbedProps = {
  url: string;
  title: string;
  compact?: boolean;
};

const YouTubeEmbed = ({ url, title, compact = false }: YouTubeEmbedProps) => {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-card"
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img src="/placeholder.svg" alt={title} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">Open this lesson on YouTube</p>
          </div>
          <ExternalLink className="h-4 w-4 text-primary" />
        </div>
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      {!compact && (
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">Watch inside the app or open on YouTube</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open
          </a>
        </div>
      )}
    </div>
  );
};

export const YouTubePreviewCard = ({ url, title }: { url: string; title: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-card"
  >
    <div className="relative aspect-video overflow-hidden bg-muted">
      <img src={getYouTubeThumbnailUrl(url)} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
      <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 opacity-0 transition group-hover:opacity-100">
        <PlayCircle className="h-12 w-12 text-primary-foreground" />
      </div>
    </div>
    <div className="flex items-center justify-between gap-3 p-4">
      <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{title}</h3>
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-primary" />
    </div>
  </a>
);

export default YouTubeEmbed;