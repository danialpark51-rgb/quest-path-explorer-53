import { useState } from "react";
import { newsItems } from "@/data/news";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const NewsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(newsItems.map((n) => n.category)))];
  const filtered = filter === "All" ? newsItems : newsItems.filter((n) => n.category === filter);
  const selected = selectedId ? newsItems.find((n) => n.id === selectedId) : null;
  const featured = filtered[0];

  // Group by date
  const grouped: Record<string, typeof newsItems> = {};
  filtered.forEach((n) => {
    const label = getDateLabel(n.date);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(n);
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">📰 Daily News</h1>
        <p className="text-sm text-muted-foreground mb-4">Stay updated with daily current affairs, world developments, education updates, and student-friendly explainers.</p>

        {featured && (
          <div className="mb-5 overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
            <img src={featured.imageUrl} alt={featured.title} className="h-52 w-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Featured current affair</span>
                <span className="text-xs text-muted-foreground">{getDateLabel(featured.date)}</span>
              </div>
              <h2 className="mt-3 text-xl font-display font-bold text-foreground">{featured.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{featured.summary}</p>
              <button type="button" onClick={() => setSelectedId(featured.id)} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                Read full update
              </button>
            </div>
          </div>
        )}

        {/* Category filters */}
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

        {/* News list grouped by date */}
        {Object.entries(grouped).map(([dateLabel, items]) => (
          <div key={dateLabel} className="mt-5">
            <h2 className="text-sm font-semibold text-primary mb-3">{dateLabel}</h2>
            <div className="space-y-3">
              {items.map((news, idx) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setSelectedId(news.id)}
                  className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-card transition"
                >
                  <div className="flex">
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-24 h-24 sm:w-32 sm:h-28 object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      loading="lazy"
                    />
                    <div className="p-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{news.emoji}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{news.category}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2">{news.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{news.summary}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground self-center mr-3 flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-elevated"
            >
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="w-full h-48 object-cover rounded-t-2xl"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
              />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selected.emoji}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{selected.category}</span>
                    <span className="text-xs text-muted-foreground">{selected.date}</span>
                  </div>
                  <button onClick={() => setSelectedId(null)} className="p-1 rounded-full hover:bg-muted transition">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">{selected.title}</h2>
                <p className="text-sm leading-7 text-foreground/90">{selected.content}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

function getDateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + "T00:00:00");
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "📅 Today";
  if (diff === 1) return "📅 Yesterday";
  if (diff <= 7) return `📅 ${diff} days ago`;
  return `📅 ${dateStr}`;
}

export default NewsPage;
