import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface NewsDataArticle {
  article_id: string;
  title: string;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url: string | null;
  category: string[] | null;
  source_name: string;
  link: string | null;
}

const CATEGORY_EMOJI: Record<string, string> = {
  education: "📚",
  science: "🔬",
  technology: "💻",
  health: "🏥",
  sports: "⚽",
  business: "💼",
  entertainment: "🎭",
  environment: "🌍",
  politics: "🏛️",
  world: "🌐",
  top: "📰",
};

function mapCategory(cats: string[] | null): string {
  if (!cats || cats.length === 0) return "General";
  const cat = cats[0];
  const map: Record<string, string> = {
    education: "Education",
    science: "Science",
    technology: "Technology",
    health: "Health",
    sports: "Sports",
    business: "Business",
    environment: "Environment",
    politics: "Government",
    world: "World",
    top: "Top News",
  };
  return map[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
}

function mapEmoji(cats: string[] | null): string {
  if (!cats || cats.length === 0) return "📰";
  return CATEGORY_EMOJI[cats[0]] ?? "📰";
}

let cache: { data: unknown; expiresAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

router.get("/news", async (req, res) => {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    res.status(503).json({ error: "News API not configured", articles: [] });
    return;
  }

  if (cache && Date.now() < cache.expiresAt) {
    res.json(cache.data);
    return;
  }

  try {
    const query = (req.query.q as string) || "education india students";
    const params = new URLSearchParams({
      apikey: apiKey,
      q: query,
      language: "en",
      category: "education,science,technology,health,sports",
    });

    const upstream = await fetch(
      `https://newsdata.io/api/1/news?${params.toString()}`,
      { headers: { Accept: "application/json" } },
    );

    if (!upstream.ok) {
      const err = await upstream.text();
      res.status(upstream.status).json({ error: "News fetch failed", detail: err });
      return;
    }

    const raw = (await upstream.json()) as {
      status: string;
      results?: NewsDataArticle[];
    };

    if (raw.status !== "success" || !raw.results) {
      res.status(502).json({ error: "Invalid API response", articles: [] });
      return;
    }

    const articles = raw.results
      .filter((a) => a.title && a.description)
      .map((a, idx) => ({
        id: a.article_id || String(idx),
        title: a.title,
        summary: a.description ?? "",
        content: a.content ?? a.description ?? "",
        category: mapCategory(a.category),
        date: a.pubDate ? a.pubDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        emoji: mapEmoji(a.category),
        imageUrl: a.image_url ?? "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        source: a.source_name,
        link: a.link ?? null,
      }));

    const result = { articles, fetchedAt: new Date().toISOString() };
    cache = { data: result, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json(result);
  } catch (_err) {
    res.status(502).json({ error: "Failed to fetch news", articles: [] });
  }
});

export default router;
