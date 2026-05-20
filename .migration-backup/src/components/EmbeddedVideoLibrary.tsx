import { motion } from "framer-motion";
import YouTubeEmbed from "@/components/YouTubeEmbed";

export type EmbeddedVideoItem = {
  label?: string;
  title: string;
  url: string;
};

type EmbeddedVideoLibraryProps = {
  videos: EmbeddedVideoItem[];
  emptyMessage?: string;
};

const EmbeddedVideoLibrary = ({
  videos,
  emptyMessage = "No lesson videos are available yet.",
}: EmbeddedVideoLibraryProps) => {
  const uniqueVideos = videos.filter(
    (video, index, all) => all.findIndex((entry) => entry.url === video.url) === index,
  );

  if (uniqueVideos.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {uniqueVideos.map((video, index) => (
        <motion.div
          key={`${video.url}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="space-y-2 rounded-3xl border border-border bg-card p-3 shadow-card"
        >
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              {video.label && (
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                  {video.label}
                </p>
              )}
              <h3 className="text-sm font-semibold text-foreground">{video.title}</h3>
            </div>
          </div>
          <YouTubeEmbed url={video.url} title={video.title} compact showExternalLink={false} />
        </motion.div>
      ))}
    </div>
  );
};

export default EmbeddedVideoLibrary;