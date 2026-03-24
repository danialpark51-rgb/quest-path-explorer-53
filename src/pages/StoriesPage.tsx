import { useMemo, useState } from "react";
import { audioStories } from "@/data/audioStories";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, ExternalLink, Headphones, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const storyVideoMap: Record<string, string> = {
  "1": "https://www.youtube.com/watch?v=arC7y8N26D4",
  "2": "https://www.youtube.com/watch?v=Dxcc6ycZ73M",
  "3": "https://www.youtube.com/watch?v=wf91rEGw88Q",
  "4": "https://www.youtube.com/watch?v=w6IaQqQXQe0",
  "5": "https://www.youtube.com/watch?v=pyhZ9qw0u7E",
  "6": "https://www.youtube.com/watch?v=7GGzc3x9WJU",
  "7": "https://www.youtube.com/watch?v=XtFTjM7lNN4",
  "8": "https://www.youtube.com/watch?v=HUP6Z5voiS8",
  "9": "https://www.youtube.com/watch?v=Un2yBgIAxYs",
  "10": "https://www.youtube.com/watch?v=Hz4FNBj1APA",
  "11": "https://www.youtube.com/watch?v=arj7oStGLkU",
  "12": "https://www.youtube.com/watch?v=0Y0R7v9YfJ4",
  "13": "https://www.youtube.com/watch?v=e-P5IFTqB98",
  "14": "https://www.youtube.com/watch?v=2ePf9rue1Ao",
  "15": "https://www.youtube.com/watch?v=VQv0M7Pr0g8",
  "16": "https://www.youtube.com/watch?v=vd2dtkMINIw",
  "17": "https://www.youtube.com/watch?v=zEPdVk-6D4Q",
  "18": "https://www.youtube.com/watch?v=JhHMJCUmq28",
};

const buildStoryParagraphs = (title: string, description: string) => [
  `${title} is now presented as a proper learning topic so students can read and understand the idea clearly before moving to video learning.`,
  description,
  "Use the summary to revise quickly, note the key learning points, and then watch the related YouTube explanation below for better understanding.",
];

const buildKeyPoints = (category: string) => [
  `This topic belongs to ${category} and is selected to keep learning relevant and easy to follow.`,
  "Read the explanation first so the video becomes easier to understand.",
  "Use this story topic for revision, discussion, and quiz preparation.",
];

const StoriesPage = () => {
  const navigate = useNavigate();
  const [selectedStoryId, setSelectedStoryId] = useState(audioStories[0]?.id ?? null);
  const [filter, setFilter] = useState("All");

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
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">🎧 Stories & Topic Reader</h1>
        <p className="text-sm text-muted-foreground mb-4">Each story now opens as a readable learning topic with a related YouTube lesson.</p>

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
          <div className="space-y-3">
            {filtered.map((story, idx) => {
              const active = selectedStory?.id === story.id;
              return (
                <motion.button
                  key={story.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setSelectedStoryId(story.id)}
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
                <div className="rounded-3xl border border-border bg-card p-5 shadow-elevated">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-primary">{selectedStory.category} topic</p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{selectedStory.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{selectedStory.description}</p>
                    </div>
                    <div className="rounded-2xl bg-muted px-3 py-2 text-right">
                      <p className="text-xs text-muted-foreground">Reading time</p>
                      <p className="text-sm font-semibold text-foreground">{selectedStory.duration}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="space-y-3">
                      {buildStoryParagraphs(selectedStory.title, selectedStory.description).map((paragraph, index) => (
                        <p key={index} className="text-sm leading-7 text-foreground/90">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <div className="rounded-2xl bg-muted p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <h3 className="font-semibold text-foreground">Key takeaways</h3>
                      </div>
                      <ul className="space-y-2">
                        {buildKeyPoints(selectedStory.category).map((point) => (
                          <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-xl font-bold text-foreground">Related YouTube explanation</h3>
                    </div>
                    <a
                      href={storyVideoMap[selectedStory.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:opacity-90"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> YouTube
                    </a>
                  </div>
                  <YouTubeEmbed url={storyVideoMap[selectedStory.id]} title={selectedStory.title} />
                </div>

                <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-display text-xl font-bold text-foreground">How to use this page</h3>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Read the topic first, note the main points, then watch the related video below. This replaces the old fake audio state with a proper topic reading page and working video support.
                  </p>
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
