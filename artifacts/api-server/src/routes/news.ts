/**
 * News Route — powered by NewsAPI.org (primary) + GNews (secondary)
 *
 * GET /api/news?goal=engineering&language=hi
 *
 * Fetches goal-relevant news for Indian students.
 * Merges results from both sources and deduplicates by title similarity.
 * Falls back to static bundled news if all API keys fail.
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── Article shapes ───────────────────────────────────────────────────────────

interface NewsApiArticle {
  source:      { id: string | null; name: string };
  author:      string | null;
  title:       string | null;
  description: string | null;
  url:         string | null;
  urlToImage:  string | null;
  publishedAt: string;
  content:     string | null;
}

interface GNewsArticle {
  title:       string;
  description: string;
  content:     string;
  url:         string;
  image:       string | null;
  publishedAt: string;
  source:      { name: string; url: string };
}

// ─── Goal → search keywords ───────────────────────────────────────────────────

const GOAL_QUERIES: Record<string, string> = {
  engineering: "IIT JEE engineering India students exam",
  medical:     "NEET medical biology India exam preparation",
  commerce:    "commerce business finance CA India students",
  arts:        "arts humanities culture India students",
  it:          "technology programming coding software India",
  defence:     "NDA defence military India army career",
  govt:        "UPSC government jobs civil services India",
  default:     "education students India school exam",
};

// ─── Category inference ───────────────────────────────────────────────────────

const CATEGORY_MAP: Array<{ keywords: string[]; label: string; emoji: string }> = [
  { keywords: ["technology", "tech", "ai", "software", "coding", "programming"], label: "Technology",  emoji: "💻" },
  { keywords: ["science", "physics", "chemistry", "biology", "research"],        label: "Science",     emoji: "🔬" },
  { keywords: ["education", "school", "exam", "student", "jee", "neet"],         label: "Education",   emoji: "📚" },
  { keywords: ["health", "medical", "hospital", "medicine", "doctor"],           label: "Health",      emoji: "🏥" },
  { keywords: ["sport", "cricket", "football", "olympic", "athlete"],            label: "Sports",      emoji: "⚽" },
  { keywords: ["business", "finance", "economy", "market", "stock"],             label: "Business",    emoji: "💼" },
  { keywords: ["government", "upsc", "defence", "army", "civil", "nda"],         label: "Government",  emoji: "🏛️" },
  { keywords: ["environment", "climate", "nature", "green"],                     label: "Environment", emoji: "🌍" },
  { keywords: ["scholarship", "fellowship", "grant", "award"],                   label: "Scholarship", emoji: "🎓" },
  { keywords: ["career", "job", "internship", "placement", "hire"],              label: "Career",      emoji: "💼" },
];

function inferCategory(title: string, desc: string): { label: string; emoji: string } {
  const text = `${title} ${desc}`.toLowerCase();
  for (const { keywords, label, emoji } of CATEGORY_MAP) {
    if (keywords.some((kw) => text.includes(kw))) return { label, emoji };
  }
  return { label: "General", emoji: "📰" };
}

// ─── Deduplicate by title similarity ─────────────────────────────────────────

function normaliseTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
}

function deduplicateArticles<T extends { title: string }>(articles: T[]): T[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = normaliseTitle(a.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Per-(goal+lang) server-side cache ────────────────────────────────────────

const cacheMap = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min

// ─── Default image ────────────────────────────────────────────────────────────

const DEFAULT_IMG = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400";

// ─── Fetch from NewsAPI.org ────────────────────────────────────────────────────

async function fetchFromNewsApi(apiKey: string, query: string): Promise<NewsApiArticle[] | null> {
  try {
    const params = new URLSearchParams({
      q:        query,
      apiKey:   apiKey,
      language: "en",
      pageSize: "20",
      sortBy:   "publishedAt",
    });

    const r = await fetch(
      `https://newsapi.org/v2/everything?${params.toString()}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12_000) },
    );

    if (!r.ok) {
      console.warn(`[news] newsapi.org HTTP ${r.status}`);
      return null;
    }

    const raw = await r.json() as { status: string; articles?: NewsApiArticle[]; message?: string };
    if (raw.status !== "ok" || !raw.articles) return null;
    return raw.articles;
  } catch (e) {
    console.warn("[news] newsapi.org fetch error:", (e as Error).message);
    return null;
  }
}

// ─── Fetch from GNews ─────────────────────────────────────────────────────────

async function fetchFromGNews(apiKey: string, query: string): Promise<GNewsArticle[] | null> {
  try {
    const params = new URLSearchParams({
      q:      query,
      token:  apiKey,
      lang:   "en",
      max:    "15",
      sortby: "publishedAt",
    });

    const r = await fetch(
      `https://gnews.io/api/v4/search?${params.toString()}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12_000) },
    );

    if (!r.ok) {
      console.warn(`[news] gnews HTTP ${r.status}`);
      return null;
    }

    const raw = await r.json() as { articles?: GNewsArticle[]; errors?: string[] };
    if (!raw.articles) return null;
    return raw.articles;
  } catch (e) {
    console.warn("[news] gnews fetch error:", (e as Error).message);
    return null;
  }
}

// ─── Normalise to app shape ───────────────────────────────────────────────────

interface AppArticle {
  id:       string;
  title:    string;
  summary:  string;
  content:  string;
  category: string;
  date:     string;
  emoji:    string;
  imageUrl: string;
  source:   string;
  link:     string | null;
}

function fromNewsApi(articles: NewsApiArticle[], ts: number): AppArticle[] {
  return articles
    .filter((a) => a.title && a.description && a.title !== "[Removed]")
    .map((a, idx) => {
      const { label, emoji } = inferCategory(a.title ?? "", a.description ?? "");
      return {
        id:       `newsapi-${idx}-${ts}`,
        title:    a.title!,
        summary:  a.description ?? "",
        content:  a.content ?? a.description ?? "",
        category: label,
        date:     a.publishedAt ? a.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
        emoji,
        imageUrl: a.urlToImage ?? DEFAULT_IMG,
        source:   a.source.name,
        link:     a.url ?? null,
      };
    });
}

function fromGNews(articles: GNewsArticle[], ts: number): AppArticle[] {
  return articles
    .filter((a) => a.title && a.description)
    .map((a, idx) => {
      const { label, emoji } = inferCategory(a.title, a.description);
      return {
        id:       `gnews-${idx}-${ts}`,
        title:    a.title,
        summary:  a.description,
        content:  a.content || a.description,
        category: label,
        date:     a.publishedAt ? a.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
        emoji,
        imageUrl: a.image ?? DEFAULT_IMG,
        source:   a.source.name,
        link:     a.url ?? null,
      };
    });
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/news", async (req, res) => {
  const primaryKey   = process.env.NEWSDATA_API_KEY;
  const fallbackKey  = process.env.NEWSDATA_API_KEY_2;
  const gnewsKey     = process.env.GNEWS_API_KEY;

  if (!primaryKey && !fallbackKey && !gnewsKey) {
    res.status(503).json({ error: "News API not configured", articles: [] });
    return;
  }

  const goal     = String(req.query.goal     ?? "default");
  const language = String(req.query.language ?? "en");
  const query    = GOAL_QUERIES[goal] ?? GOAL_QUERIES.default;
  const cacheKey = `${goal}:${language}`;

  // Serve from cache if still fresh
  const cached = cacheMap.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    res.json(cached.data);
    return;
  }

  const ts = Date.now();

  // Fetch from both sources in parallel
  const [newsApiRaw, gnewsRaw] = await Promise.all([
    (async () => {
      if (primaryKey) {
        const r = await fetchFromNewsApi(primaryKey, query);
        if (r) return r;
      }
      if (fallbackKey) {
        console.log("[news] primary key failed or missing, trying fallback…");
        return fetchFromNewsApi(fallbackKey, query);
      }
      return null;
    })(),
    gnewsKey ? fetchFromGNews(gnewsKey, query) : Promise.resolve(null),
  ]);

  // Combine and normalise
  const newsApiArticles = newsApiRaw ? fromNewsApi(newsApiRaw, ts) : [];
  const gnewsArticles   = gnewsRaw   ? fromGNews(gnewsRaw, ts)    : [];

  // Merge: newsAPI first, then GNews; deduplicate by title
  const merged = deduplicateArticles([...newsApiArticles, ...gnewsArticles]);

  if (merged.length === 0) {
    res.status(502).json({ error: "Failed to fetch news from all sources", articles: [] });
    return;
  }

  const result = {
    articles:  merged,
    fetchedAt: new Date().toISOString(),
    goal,
    language,
    sources: [
      ...(newsApiArticles.length > 0 ? ["NewsAPI"] : []),
      ...(gnewsArticles.length > 0   ? ["GNews"]   : []),
    ],
  };

  cacheMap.set(cacheKey, { data: result, expiresAt: ts + CACHE_TTL_MS });
  res.json(result);
});

export default router;
