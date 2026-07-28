import { useState, useEffect } from "react";
import { newsItems as staticNews, type NewsItem } from "@/data/news";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, X, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type ApiArticle = NewsItem & { source?: string; link?: string | null };

const NewsPage = () => {
  const navigate = useNavigate();
  const { user }  = useUser();
  const { language } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveNews, setLiveNews] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [liveSources, setLiveSources] = useState<string[]>([]);

  const fetchNews = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const goal = user?.selectedGoal ?? "default";
      const params = new URLSearchParams({ goal, language });
      if (forceRefresh) params.set("nocache", "1");
      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json() as {
        articles: ApiArticle[];
        fetchedAt?: string;
        sources?: string[];
        totalLive?: number;
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      if (data.articles && data.articles.length > 0) {
        setLiveNews(data.articles);
        if (data.fetchedAt) setLastFetched(data.fetchedAt);
        // Store sources for label display
        if (data.sources) setLiveSources(data.sources);
      } else {
        setLiveNews([]);
      }
    } catch {
      setError("Could not load live news. Showing curated stories.");
      setLiveNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.selectedGoal, language]);

  const allNews: ApiArticle[] = liveNews.length > 0 ? liveNews : (staticNews as ApiArticle[]);
  const categories = ["All", ...Array.from(new Set(allNews.map((n) => n.category)))];
  const filtered = filter === "All" ? allNews : allNews.filter((n) => n.category === filter);
  const selected: ApiArticle | undefined = selectedId ? allNews.find((n) => n.id === selectedId) : undefined;
  const featured = filtered[0];

  const grouped: Record<string, ApiArticle[]> = {};
  filtered.slice(1).forEach((n) => {
    const label = getDateLabel(n.date);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(n);
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <button
            onClick={() => fetchNews(true)}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-1">📰 Daily News</h1>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm text-muted-foreground">
            {liveNews.length > 0
              ? `Live news · ${liveSources.filter(s => s !== "Curated").join(", ") || "Curated"}`
              : "Stay updated with latest education & career stories"}
          </p>
          {liveNews.length > 0 && liveSources.some(s => s !== "Curated") && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-medium">● LIVE</span>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading latest news...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-sm text-yellow-800 dark:text-yellow-300">
            ⚠️ {error}
          </div>
        )}

        {!loading && featured && (
          <div className="mb-5 overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
            <img
              src={featured.imageUrl}
              alt={featured.title}
              className="h-52 w-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Featured
                </span>
                <span className="text-xs text-muted-foreground">{getDateLabel(featured.date)}</span>
                {(featured as ApiArticle).source && (
                  <span className="text-xs text-muted-foreground">· {(featured as ApiArticle).source}</span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-display font-bold text-foreground">{featured.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{featured.summary}</p>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedId(featured.id)}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Read full story
                </button>
                {(featured as ApiArticle).link && (
                  <a
                    href={(featured as ApiArticle).link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    Source <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <>
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
                          {(news as ApiArticle).source && (
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{(news as ApiArticle).source}</p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground self-center mr-3 flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">No news found for this category.</p>
              </div>
            )}

            {lastFetched && (
              <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
                Last updated: {new Date(lastFetched).toLocaleTimeString()}
              </p>
            )}
          </>
        )}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">{selected.emoji}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{selected.category}</span>
                    <span className="text-xs text-muted-foreground">{selected.date}</span>
                    {(selected as ApiArticle).source && (
                      <span className="text-xs text-muted-foreground">· {(selected as ApiArticle).source}</span>
                    )}
                  </div>
                  <button onClick={() => setSelectedId(null)} className="p-1 rounded-full hover:bg-muted transition">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">{selected.title}</h2>
                <p className="text-sm leading-7 text-foreground/90 mb-4">{selected.content}</p>
                {(selected as ApiArticle).link && (
                  <a
                    href={(selected as ApiArticle).link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Read original article <ExternalLink className="w-3 h-3" />
                  </a>
                )}
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
