import { useState } from "react";
import { audioStories } from "@/data/audioStories";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, Volume2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const StoriesPage = () => {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(audioStories.map((s) => s.category)))];
  const filtered = filter === "All" ? audioStories : audioStories.filter((s) => s.category === filter);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">🎧 Audio Stories</h1>
        <p className="text-sm text-muted-foreground mb-4">Listen and learn from fascinating stories</p>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stories list */}
        <div className="space-y-3 mt-4">
          {filtered.map((story, idx) => {
            const isPlaying = playing === story.id;
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-card border rounded-xl p-4 flex items-start gap-3 transition ${isPlaying ? "border-primary shadow-glow" : "border-border"}`}
              >
                <span className="text-3xl flex-shrink-0">{story.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{story.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{story.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{story.category}</span>
                    <span className="text-xs text-muted-foreground">{story.duration}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPlaying(isPlaying ? null : story.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition ${isPlaying ? "gradient-hero" : "bg-muted hover:bg-primary/10"}`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-foreground" />}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Now Playing Bar */}
        <AnimatePresence>
          {playing && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-16 left-0 right-0 z-40 px-4"
            >
              <div className="max-w-2xl mx-auto gradient-hero rounded-xl p-3 flex items-center gap-3 shadow-elevated">
                <Volume2 className="w-5 h-5 text-primary-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-foreground truncate">
                    {audioStories.find((s) => s.id === playing)?.title}
                  </p>
                  <div className="w-full h-1 bg-primary-foreground/30 rounded-full mt-1">
                    <div className="h-full w-1/3 bg-primary-foreground rounded-full animate-pulse" />
                  </div>
                </div>
                <button onClick={() => setPlaying(null)} className="text-primary-foreground">
                  <Pause className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default StoriesPage;
