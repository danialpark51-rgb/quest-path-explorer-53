/**
 * News Route — GET /api/news?goal=engineering&language=hi
 *
 * Provider cascade:
 *   1. NewsData.io  (NEWSDATA_API_KEY  — primary, real-time India news)
 *   2. GNews        (GNEWS_API_KEY     — secondary, 12-hour delay on free plan)
 *   3. Static curated fallback  (always 8 articles)
 *
 * 30-minute server-side cache per (goal, language) pair.
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsDataArticle {
  title:        string | null;
  description:  string | null;
  content:      string | null;
  link:         string | null;
  image_url:    string | null;
  pubDate:      string | null;
  source_id:    string;
  source_name:  string | null;
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

// ─── Category inference ───────────────────────────────────────────────────────

const CATEGORY_MAP: Array<{ keywords: string[]; label: string; emoji: string }> = [
  { keywords: ["technology", "tech", "ai", "software", "coding", "programming", "digital", "cyber", "robot", "computer"], label: "Technology",  emoji: "💻" },
  { keywords: ["science", "physics", "chemistry", "biology", "research", "space", "isro", "nasa"],                        label: "Science",     emoji: "🔬" },
  { keywords: ["education", "school", "exam", "student", "jee", "neet", "cbse", "syllabus", "university", "college"],    label: "Education",   emoji: "📚" },
  { keywords: ["health", "medical", "hospital", "medicine", "doctor", "pharma", "drug", "vaccine", "disease"],           label: "Health",      emoji: "🏥" },
  { keywords: ["sport", "cricket", "football", "olympic", "athlete", "tournament", "chess", "badminton"],                 label: "Sports",      emoji: "⚽" },
  { keywords: ["business", "finance", "economy", "market", "stock", "gdp", "budget", "rbi", "sebi"],                     label: "Business",    emoji: "💼" },
  { keywords: ["government", "upsc", "defence", "army", "civil", "nda", "policy", "minister", "parliament"],             label: "Government",  emoji: "🏛️" },
  { keywords: ["environment", "climate", "nature", "green", "solar", "pollution", "wildlife"],                            label: "Environment", emoji: "🌍" },
  { keywords: ["scholarship", "fellowship", "grant", "award", "prize", "recognition"],                                    label: "Scholarship", emoji: "🎓" },
  { keywords: ["career", "job", "internship", "placement", "hiring", "salary", "startup"],                               label: "Career",      emoji: "🚀" },
];

function inferCategory(title: string, desc: string): { label: string; emoji: string } {
  const text = `${title} ${desc}`.toLowerCase();
  for (const { keywords, label, emoji } of CATEGORY_MAP) {
    if (keywords.some((kw) => text.includes(kw))) return { label, emoji };
  }
  return { label: "General", emoji: "📰" };
}

// ─── Goal → search query ──────────────────────────────────────────────────────

const GOAL_QUERIES: Record<string, string> = {
  engineering: "IIT JEE engineering technology India students",
  medical:     "NEET medical doctor healthcare India",
  commerce:    "commerce business finance CA economy India",
  arts:        "arts design creative culture India students",
  it:          "technology software AI programming India",
  defence:     "NDA army navy air force defence India",
  govt:        "UPSC civil services IAS government India",
  default:     "education students exam career India 2025",
};

// ─── Deduplication ────────────────────────────────────────────────────────────

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

// ─── Cache (cleared on server restart) ───────────────────────────────────────

const cacheMap = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

// ─── Default image ────────────────────────────────────────────────────────────

const DEFAULT_IMG = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400";

// ─── Fetch from NewsData.io ───────────────────────────────────────────────────

async function fetchFromNewsData(apiKey: string, query: string): Promise<NewsDataArticle[] | null> {
  try {
    const params = new URLSearchParams({
      apikey:   apiKey,
      q:        query,
      language: "en",
      country:  "in",
      size:     "10",
    });

    const r = await fetch(
      `https://newsdata.io/api/1/news?${params.toString()}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15_000) },
    );

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.warn(`[news] NewsData.io HTTP ${r.status}:`, body.slice(0, 200));
      return null;
    }

    const raw = await r.json() as {
      status: string;
      results?: NewsDataArticle[];
      message?: string;
      totalResults?: number;
    };

    if (raw.status !== "success" || !raw.results || raw.results.length === 0) {
      console.warn("[news] NewsData.io: no results, status:", raw.status, "msg:", raw.message?.slice(0, 100));
      return null;
    }

    console.info(`[news] NewsData.io: ${raw.results.length} articles for query "${query}"`);
    return raw.results;
  } catch (e) {
    console.warn("[news] NewsData.io fetch error:", (e as Error).message);
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
      max:    "10",
      sortby: "publishedAt",
    });

    const r = await fetch(
      `https://gnews.io/api/v4/search?${params.toString()}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15_000) },
    );

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.warn(`[news] GNews HTTP ${r.status}:`, body.slice(0, 150));
      return null;
    }

    const raw = await r.json() as { articles?: GNewsArticle[]; totalArticles?: number; errors?: string[] };
    if (!raw.articles || raw.articles.length === 0) {
      console.warn("[news] GNews: no articles in response");
      return null;
    }

    console.info(`[news] GNews: ${raw.articles.length} articles for query "${query}"`);
    return raw.articles;
  } catch (e) {
    console.warn("[news] GNews fetch error:", (e as Error).message);
    return null;
  }
}

// ─── Normalise to AppArticle ──────────────────────────────────────────────────

function fromNewsData(articles: NewsDataArticle[], ts: number): AppArticle[] {
  return articles
    .filter((a) => a.title && a.title !== "[Removed]" && a.description)
    .map((a, idx) => {
      const { label, emoji } = inferCategory(a.title ?? "", a.description ?? "");
      return {
        id:       `nd-${idx}-${ts}`,
        title:    a.title!,
        summary:  a.description ?? "",
        content:  a.content ?? a.description ?? "",
        category: label,
        date:     a.pubDate ? a.pubDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        emoji,
        imageUrl: a.image_url ?? DEFAULT_IMG,
        source:   a.source_name ?? a.source_id,
        link:     a.link ?? null,
      };
    });
}

function fromGNews(articles: GNewsArticle[], ts: number): AppArticle[] {
  return articles
    .filter((a) => a.title && a.description)
    .map((a, idx) => {
      const { label, emoji } = inferCategory(a.title, a.description);
      return {
        id:       `gn-${idx}-${ts}`,
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

// ─── Static fallback ──────────────────────────────────────────────────────────

function getStaticArticles(goal: string): AppArticle[] {
  const ts    = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  const base: AppArticle[] = [
    {
      id: `s1-${ts}`, category: "Education", emoji: "📚", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: "https://jeeadv.ac.in",
      title:   "JEE Advanced 2025: Registration Opens — Key Dates and How to Apply",
      summary: "IIT Bombay has announced the schedule for JEE Advanced 2025. Students who qualify JEE Mains can register now.",
      content: "IIT Bombay, the organising institute for JEE Advanced 2025, has released key dates. Students who clear JEE Main cutoffs are eligible to apply. The exam tests Physics, Chemistry, and Mathematics at an advanced level.",
    },
    {
      id: `s2-${ts}`, category: "Education", emoji: "🔬", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: "https://nta.ac.in",
      title:   "NEET UG 2025: Important Updates on Exam Pattern and Syllabus",
      summary: "National Medical Commission has clarified the NEET UG 2025 syllabus. No major pattern changes.",
      content: "Medical aspirants can breathe easy as the NEET UG 2025 syllabus remains largely unchanged. The NMC has published the official syllabus on its website for download.",
    },
    {
      id: `s3-${ts}`, category: "Technology", emoji: "💻", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: null,
      title:   "India Ranks 3rd Globally in Number of STEM Graduates — Report 2025",
      summary: "India produces over 2.6 million STEM graduates annually, trailing only China and the US.",
      content: "India's STEM education ecosystem has seen explosive growth. Engineering colleges are now producing graduates in AI, ML, and data science at record rates.",
    },
    {
      id: `s4-${ts}`, category: "Scholarship", emoji: "🎓", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: "https://scholarships.gov.in",
      title:   "National Scholarship Portal 2025: Apply Before the Deadline",
      summary: "NSP scholarships worth up to ₹1.2 lakh per year available for students. Application portal is live.",
      content: "The National Scholarship Portal has reopened applications for 2025-26. Over 50 central and state government scholarships are available through the single portal.",
    },
    {
      id: `s5-${ts}`, category: "Government", emoji: "🏛️", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: "https://upsc.gov.in",
      title:   "UPSC Civil Services 2025 Notification Released — Eligibility and Dates",
      summary: "Over 1000 vacancies across IAS, IPS, IFS and allied services announced by UPSC.",
      content: "The Union Public Service Commission has officially notified the Civil Services Examination 2025. Candidates with a bachelor's degree from any recognised university are eligible.",
    },
    {
      id: `s6-${ts}`, category: "Career", emoji: "🚀", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: null,
      title:   "Google, Microsoft, Amazon Increase India Campus Hiring for 2025",
      summary: "Big Tech companies are ramping up campus hiring from IITs, NITs and top engineering colleges.",
      content: "Major technology companies have announced increased campus recruitment drives across Indian engineering institutions. AI/ML, full-stack development roles are most in demand.",
    },
    {
      id: `s7-${ts}`, category: "Science", emoji: "🛸", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: "https://isro.gov.in",
      title:   "ISRO Young Scientist Programme (YUVIKA) 2025 — Applications Open",
      summary: "ISRO invites Class 9 students to its space science residential camp. Real space research experience.",
      content: "The Indian Space Research Organisation invites applications for its Young Scientist Programme. Selected students spend two weeks at ISRO centres learning about rockets, satellites and space science.",
    },
    {
      id: `s8-${ts}`, category: "Education", emoji: "📝", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: "https://cbse.gov.in",
      title:   "CBSE Class 10 & 12 Board Exams 2025: Complete Datesheet Released",
      summary: "CBSE has released the official datesheet for Board Exams 2025. Download from cbse.gov.in.",
      content: "The Central Board of Secondary Education has published the complete time-table for 2025 board examinations. Students are advised to plan their revision schedule accordingly.",
    },
    {
      id: `s9-${ts}`, category: "Technology", emoji: "🤖", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: null,
      title:   "AI in Indian Education: 500 Schools Adopt Smart Learning Platforms",
      summary: "AI-powered personalised learning tools are being deployed in 500 schools across India.",
      content: "India's education technology sector is booming. AI tools now help teachers personalise learning for students, identify weak areas, and adapt content in real time.",
    },
    {
      id: `s10-${ts}`, category: "Career", emoji: "💼", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath", link: null,
      title:   "Top 10 Highest-Paying Careers in India for 2025 Graduates",
      summary: "Data Science, AI, Investment Banking, and Medicine top the list of highest-paying career paths.",
      content: "A new salary survey highlights the top career paths for Indian graduates. Data Scientists and AI Engineers lead at ₹15–50 LPA starting salary, followed by Investment Banking and Medical specialists.",
    },
  ];

  // Goal-specific ordering
  if (goal === "engineering" || goal === "it") {
    return [base[2], base[0], base[5], base[8], base[6], base[3], base[4], base[9], base[1], base[7]];
  }
  if (goal === "medical") {
    return [base[1], base[3], base[6], base[0], base[2], base[4], base[7], base[5], base[8], base[9]];
  }
  if (goal === "govt") {
    return [base[4], base[7], base[0], base[3], base[5], base[6], base[2], base[1], base[8], base[9]];
  }
  if (goal === "commerce") {
    return [base[9], base[3], base[5], base[4], base[0], base[2], base[6], base[7], base[1], base[8]];
  }
  return base;
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/news", async (req, res) => {
  const newsDataKey = process.env.NEWSDATA_API_KEY;
  const gnewsKey    = process.env.GNEWS_API_KEY;

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

  // ── Fetch from NewsData.io (primary) and GNews (secondary) in parallel ──
  const [newsDataRaw, gnewsRaw] = await Promise.all([
    newsDataKey ? fetchFromNewsData(newsDataKey, query) : Promise.resolve(null),
    gnewsKey    ? fetchFromGNews(gnewsKey, query)       : Promise.resolve(null),
  ]);

  const newsDataArticles = newsDataRaw ? fromNewsData(newsDataRaw, ts) : [];
  const gnewsArticles    = gnewsRaw    ? fromGNews(gnewsRaw, ts)       : [];

  // Merge: NewsData first (real-time), then GNews; deduplicate
  let merged = deduplicateArticles([...newsDataArticles, ...gnewsArticles]);

  const sources: string[] = [
    ...(newsDataArticles.length > 0 ? ["NewsData.io"] : []),
    ...(gnewsArticles.length > 0    ? ["GNews"]       : []),
  ];

  // Supplement with static articles to always have ≥ 8 items
  if (merged.length < 8) {
    const staticArticles = getStaticArticles(goal).filter(
      (s) => !merged.some((m) => normaliseTitle(m.title) === normaliseTitle(s.title)),
    );
    merged = [...merged, ...staticArticles].slice(0, 15);
    if (!sources.includes("Curated")) sources.push("Curated");
  } else {
    merged = merged.slice(0, 15);
  }

  const result = {
    articles:  merged,
    fetchedAt: new Date().toISOString(),
    goal,
    language,
    sources,
    totalLive: newsDataArticles.length + gnewsArticles.length,
  };

  cacheMap.set(cacheKey, { data: result, expiresAt: ts + CACHE_TTL_MS });
  res.json(result);
});

export default router;
