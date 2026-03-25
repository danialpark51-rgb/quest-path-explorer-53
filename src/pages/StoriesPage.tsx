import { useMemo, useState } from "react";
import { audioStories } from "@/data/audioStories";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TextToSpeechPlayer from "@/components/TextToSpeechPlayer";

const StoriesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStoryId, setSelectedStoryId] = useState(searchParams.get("story") ?? audioStories[0]?.id ?? null);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(true);

  const categories = ["All", ...Array.from(new Set(audioStories.map((s) => s.category)))];
  const filtered = filter === "All" ? audioStories : audioStories.filter((s) => s.category === filter);
  const selectedStory = useMemo(
    () => filtered.find((story) => story.id === selectedStoryId) ?? filtered[0] ?? null,
    [filtered, selectedStoryId],
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">📖 Stories & Learning Topics</h1>
        <p className="text-sm text-muted-foreground mb-4">Read detailed stories on fascinating topics. Each story includes full content and key takeaways.</p>

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

        <div className="mt-4 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.map((story, idx) => {
              const active = selectedStory?.id === story.id;
              return (
                <motion.button
                  key={story.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => {
                    setSelectedStoryId(story.id);
                    setSearchParams({ story: story.id });
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/5 shadow-card" : "border-border bg-card hover:shadow-card"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{story.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm">{story.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{story.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{story.category}</span>
                        <span className="text-xs text-muted-foreground">{story.duration}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {selectedStory && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStory.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-elevated">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-primary">{selectedStory.category}</p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{selectedStory.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{selectedStory.description}</p>
                    </div>
                    <div className="rounded-2xl bg-muted px-3 py-2 text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">Reading time</p>
                      <p className="text-sm font-semibold text-foreground">{selectedStory.duration}</p>
                    </div>
                  </div>
                  <TextToSpeechPlayer text={selectedStory.content} title={`Listen to ${selectedStory.title}`} />
                </div>

                {/* Full Content */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-xl font-bold text-foreground">Full Story</h3>
                    </div>
                    {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  {expanded && (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {selectedStory.content.split("\n\n").map((para, i) => (
                        <p key={i} className="text-sm leading-7 text-foreground/90 mb-4">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Key Takeaways */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <h3 className="font-display text-xl font-bold text-foreground">Key Takeaways</h3>
                  </div>
                  <ul className="space-y-3">
                    {selectedStory.keyTakeaways.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm text-foreground/90">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default StoriesPage;
