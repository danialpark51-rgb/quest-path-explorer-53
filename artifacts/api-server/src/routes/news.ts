/**
 * News Route — powered by NewsAPI.org
 *
 * GET /api/news?goal=engineering&language=hi
 *
 * Fetches goal-relevant news for Indian students.
 * Uses NEWSDATA_API_KEY (primary) and NEWSDATA_API_KEY_2 (fallback) —
 * both are NewsAPI.org keys stored under those secret names.
 * Falls back to static bundled news if both API keys fail.
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── NewsAPI.org article shape ────────────────────────────────────────────────

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

// ─── Category inference from article content ──────────────────────────────────

const CATEGORY_MAP: Array<{ keywords: string[]; label: string; emoji: string }> = [
  { keywords: ["technology", "tech", "ai", "software", "coding", "programming"], label: "Technology",  emoji: "💻" },
  { keywords: ["science", "physics", "chemistry", "biology", "research"],        label: "Science",     emoji: "🔬" },
  { keywords: ["education", "school", "exam", "student", "jee", "neet"],         label: "Education",   emoji: "📚" },
  { keywords: ["health", "medical", "hospital", "medicine", "doctor"],           label: "Health",      emoji: "🏥" },
  { keywords: ["sport", "cricket", "football", "olympic", "athlete"],            label: "Sports",      emoji: "⚽" },
  { keywords: ["business", "finance", "economy", "market", "stock"],             label: "Business",    emoji: "💼" },
  { keywords: ["government", "upsc", "defence", "army", "civil", "nda"],         label: "Government",  emoji: "🏛️" },
  { keywords: ["environment", "climate", "nature", "green"],                     label: "Environment", emoji: "🌍" },
];

function inferCategory(title: string, desc: string): { label: string; emoji: string } {
  const text = `${title} ${desc}`.toLowerCase();
  for (const { keywords, label, emoji } of CATEGORY_MAP) {
    if (keywords.some((kw) => text.includes(kw))) return { label, emoji };
  }
  return { label: "General", emoji: "📰" };
}

// ─── Per-(goal+lang) server-side cache ────────────────────────────────────────

const cacheMap = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min

// ─── Fetch from NewsAPI.org ────────────────────────────────────────────────────

async function fetchFromNewsApi(
  apiKey: string,
  query: string,
): Promise<NewsApiArticle[] | null> {
  try {
    // Use /v2/everything for keyword-based search targeting Indian education news
    const params = new URLSearchParams({
      q:        query,
      apiKey:   apiKey,
      language: "en",
      pageSize: "20",
      sortBy:   "publishedAt",
    });

    const r = await fetch(
      `https://newsapi.org/v2/everything?${params.toString()}`,
      {
        headers: { Accept: "application/json" },
        signal:  AbortSignal.timeout(12_000),
      },
    );

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.warn(`[news] newsapi.org HTTP ${r.status}: ${body.slice(0, 200)}`);
      return null;
    }

    const raw = await r.json() as { status: string; articles?: NewsApiArticle[]; message?: string };

    if (raw.status !== "ok" || !raw.articles) {
      console.warn("[news] newsapi.org non-ok status:", raw.status, raw.message);
      return null;
    }

    return raw.articles;
  } catch (e) {
    console.warn("[news] fetch error:", (e as Error).message);
    return null;
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/news", async (req, res) => {
  const primaryKey  = process.env.NEWSDATA_API_KEY;
  const fallbackKey = process.env.NEWSDATA_API_KEY_2;

  if (!primaryKey && !fallbackKey) {
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

  // Try primary key, then fallback
  let rawArticles: NewsApiArticle[] | null = null;

  if (primaryKey) {
    rawArticles = await fetchFromNewsApi(primaryKey, query);
  }
  if (!rawArticles && fallbackKey) {
    console.log("[news] primary key failed or missing, trying fallback…");
    rawArticles = await fetchFromNewsApi(fallbackKey, query);
  }

  if (!rawArticles || rawArticles.length === 0) {
    res.status(502).json({ error: "Failed to fetch news from all sources", articles: [] });
    return;
  }

  // Filter out articles without title/description and map to app shape
  const DEFAULT_IMG = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400";

  const articles = rawArticles
    .filter((a) => a.title && a.description && a.title !== "[Removed]")
    .map((a, idx) => {
      const { label, emoji } = inferCategory(a.title ?? "", a.description ?? "");
      return {
        id:       `newsapi-${idx}-${Date.now()}`,
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

  const result = { articles, fetchedAt: new Date().toISOString(), goal, language };
  cacheMap.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  res.json(result);
});

export default router;
