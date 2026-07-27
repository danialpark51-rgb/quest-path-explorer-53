/**
 * News Route — powered by GNews (primary) + NewsData.io (secondary)
 *
 * GET /api/news?goal=engineering&language=hi
 *
 * Fetches goal-relevant news for Indian students.
 * Falls back to curated static articles if all live APIs fail.
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── Article shapes ───────────────────────────────────────────────────────────

interface GNewsArticle {
  title:       string;
  description: string;
  content:     string;
  url:         string;
  image:       string | null;
  publishedAt: string;
  source:      { name: string; url: string };
}

interface NewsDataArticle {
  title:       string | null;
  description: string | null;
  content:     string | null;
  link:        string | null;
  image_url:   string | null;
  pubDate:     string | null;
  source_id:   string;
  source_name: string | null;
}

// ─── Goal → search keywords ───────────────────────────────────────────────────

const GOAL_QUERIES: Record<string, string> = {
  engineering: "IIT JEE engineering India students",
  medical:     "NEET medical biology India exam",
  commerce:    "commerce business CA India students",
  arts:        "arts humanities culture India students",
  it:          "technology programming software India",
  defence:     "NDA defence military India army",
  govt:        "UPSC government civil services India",
  default:     "education students India exam career",
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
  { keywords: ["career", "job", "internship", "placement"],                      label: "Career",      emoji: "💼" },
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
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — reduces GNews rate-limit risk

// ─── Default image ────────────────────────────────────────────────────────────

const DEFAULT_IMG = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400";

// ─── Fetch from GNews ─────────────────────────────────────────────────────────

async function fetchFromGNews(apiKey: string, query: string): Promise<GNewsArticle[] | null> {
  try {
    const params = new URLSearchParams({
      q:      query,
      token:  apiKey,
      lang:   "en",
      max:    "20",
      sortby: "publishedAt",
    });

    const r = await fetch(
      `https://gnews.io/api/v4/search?${params.toString()}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12_000) },
    );

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.warn(`[news] GNews HTTP ${r.status}:`, body.slice(0, 150));
      return null;
    }

    const raw = await r.json() as { articles?: GNewsArticle[]; errors?: string[] };
    if (!raw.articles) return null;
    return raw.articles;
  } catch (e) {
    console.warn("[news] GNews fetch error:", (e as Error).message);
    return null;
  }
}

// ─── Fetch from NewsData.io ───────────────────────────────────────────────────

async function fetchFromNewsData(apiKey: string, query: string): Promise<NewsDataArticle[] | null> {
  try {
    const params = new URLSearchParams({
      apikey:   apiKey,
      q:        query,
      language: "en",
      size:     "15",
      country:  "in",
    });

    const r = await fetch(
      `https://newsdata.io/api/1/news?${params.toString()}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12_000) },
    );

    if (!r.ok) {
      console.warn(`[news] NewsData.io HTTP ${r.status}`);
      return null;
    }

    const raw = await r.json() as { status: string; results?: NewsDataArticle[]; message?: string };
    if (raw.status !== "success" || !raw.results) return null;
    return raw.results;
  } catch (e) {
    console.warn("[news] NewsData.io fetch error:", (e as Error).message);
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

function fromNewsData(articles: NewsDataArticle[], ts: number): AppArticle[] {
  return articles
    .filter((a) => a.title && a.description && a.title !== "[Removed]")
    .map((a, idx) => {
      const { label, emoji } = inferCategory(a.title ?? "", a.description ?? "");
      return {
        id:       `newsdata-${idx}-${ts}`,
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

// ─── Static fallback articles ─────────────────────────────────────────────────

function getStaticArticles(goal: string): AppArticle[] {
  const ts = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const articles: AppArticle[] = [
    {
      id: `static-1-${ts}`,
      title: "JEE Advanced 2025: Registration Opens — Key Dates and How to Apply",
      summary: "IIT Bombay has announced the schedule for JEE Advanced 2025. Students who qualify JEE Mains can register for JEE Advanced through the official portal.",
      content: "IIT Bombay, the organising institute for JEE Advanced 2025, has released key dates. Students who clear JEE Main cutoffs are eligible to apply. The exam tests Physics, Chemistry, and Mathematics at an advanced level.",
      category: "Education", emoji: "📚", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath Static", link: "https://jeeadv.ac.in",
    },
    {
      id: `static-2-${ts}`,
      title: "NEET UG 2025: Important Updates on Exam Pattern and Syllabus",
      summary: "National Medical Commission has clarified the NEET UG 2025 syllabus. Physics, Chemistry and Biology remain core subjects with no major pattern changes.",
      content: "Medical aspirants can breathe easy as the NEET UG 2025 syllabus remains largely unchanged. The NMC has published the official syllabus on its website for download.",
      category: "Education", emoji: "🔬", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath Static", link: "https://nta.ac.in",
    },
    {
      id: `static-3-${ts}`,
      title: "India Ranks 3rd Globally in Number of STEM Graduates — Report 2025",
      summary: "A new global report shows India produces over 2.6 million STEM graduates annually, trailing only China and the US. Tech sector demand drives engineering enrolment.",
      content: "India's STEM education ecosystem has seen explosive growth over the past decade. Engineering colleges across India are now producing graduates in AI, ML, and data science at record rates.",
      category: "Technology", emoji: "💻", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath Static", link: null,
    },
    {
      id: `static-4-${ts}`,
      title: "National Scholarship Portal 2025: Apply Before the Deadline",
      summary: "NSP scholarships worth up to ₹1.2 lakh per year are available for minority, OBC, and economically weaker section students. Application portal is now live.",
      content: "The National Scholarship Portal (scholarships.gov.in) has reopened applications for 2025-26. Over 50 central and state government scholarships are available through the single portal.",
      category: "Scholarship", emoji: "🎓", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath Static", link: "https://scholarships.gov.in",
    },
    {
      id: `static-5-${ts}`,
      title: "UPSC Civil Services 2025 Notification Released — Eligibility and Dates",
      summary: "UPSC has released the Civil Services 2025 notification. Over 1000 vacancies across IAS, IPS, IFS and allied services. Minimum age is 21 years.",
      content: "The Union Public Service Commission has officially notified the Civil Services Examination 2025. Candidates with a bachelor's degree from any recognised university are eligible. Applications close next month.",
      category: "Government", emoji: "🏛️", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath Static", link: "https://upsc.gov.in",
    },
    {
      id: `static-6-${ts}`,
      title: "Google, Microsoft, Amazon Increase India Campus Hiring for 2025",
      summary: "Big Tech companies are ramping up campus hiring from IITs, NITs and top engineering colleges. AI and cloud roles dominate the hiring season.",
      content: "Major technology companies have announced increased campus recruitment drives across Indian engineering institutions. Data Science, AI/ML, and full-stack development roles are most in demand.",
      category: "Career", emoji: "💼", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath Static", link: null,
    },
    {
      id: `static-7-${ts}`,
      title: "ISRO Young Scientist Programme (YUVIKA) 2025 — Applications Open",
      summary: "ISRO's YUVIKA programme invites Class 9 students to its space science residential camp. Students experience real space research at ISRO centres.",
      content: "The Indian Space Research Organisation invites applications for its Young Scientist Programme. Selected students spend two weeks at ISRO centres learning about rockets, satellites and space science.",
      category: "Science", emoji: "🚀", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath Static", link: "https://isro.gov.in",
    },
    {
      id: `static-8-${ts}`,
      title: "CBSE Class 10, 12 Board Exams 2025: Datesheet Released",
      summary: "CBSE has released the official datesheet for Board Exams 2025. Class 10 exams begin in February and Class 12 in March. Download the PDF from cbse.gov.in.",
      content: "The Central Board of Secondary Education has published the complete time-table for the 2025 board examinations. Students are advised to plan their revision schedule accordingly.",
      category: "Education", emoji: "📝", date: today, imageUrl: DEFAULT_IMG,
      source: "EduPath Static", link: "https://cbse.gov.in",
    },
  ];

  // Boost goal-relevant articles to the top
  if (goal === "engineering" || goal === "it") {
    return [articles[2], articles[0], articles[5], articles[6], articles[3], articles[4], articles[7], articles[1]];
  }
  if (goal === "medical") {
    return [articles[1], articles[3], articles[6], articles[0], articles[2], articles[4], articles[7], articles[5]];
  }
  if (goal === "govt") {
    return [articles[4], articles[7], articles[0], articles[3], articles[5], articles[6], articles[2], articles[1]];
  }
  return articles;
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/news", async (req, res) => {
  const gnewsKey     = process.env.GNEWS_API_KEY;
  const newsDataKey  = process.env.NEWSDATA_API_KEY;
  const newsDataKey2 = process.env.NEWSDATA_API_KEY_2;

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

  // Fetch from GNews (primary) and NewsData.io (secondary) in parallel
  const [gnewsRaw, newsDataRaw] = await Promise.all([
    gnewsKey ? fetchFromGNews(gnewsKey, query) : Promise.resolve(null),
    (async () => {
      if (newsDataKey) {
        const r = await fetchFromNewsData(newsDataKey, query);
        if (r) return r;
      }
      if (newsDataKey2) {
        return fetchFromNewsData(newsDataKey2, query);
      }
      return null;
    })(),
  ]);

  const gnewsArticles    = gnewsRaw    ? fromGNews(gnewsRaw, ts)       : [];
  const newsDataArticles = newsDataRaw ? fromNewsData(newsDataRaw, ts) : [];

  // Merge: GNews first (working), then NewsData; deduplicate
  let merged = deduplicateArticles([...gnewsArticles, ...newsDataArticles]);

  const sources: string[] = [
    ...(gnewsArticles.length > 0    ? ["GNews"]       : []),
    ...(newsDataArticles.length > 0 ? ["NewsData.io"]  : []),
  ];

  // Always supplement with static articles to ensure at least 8 items
  if (merged.length < 8) {
    const staticArticles = getStaticArticles(goal).filter(
      (s) => !merged.some((m) => normaliseTitle(m.title) === normaliseTitle(s.title))
    );
    merged = [...merged, ...staticArticles].slice(0, 15);
    if (!sources.includes("Curated")) sources.push("Curated");
  }

  const result = {
    articles:  merged,
    fetchedAt: new Date().toISOString(),
    goal,
    language,
    sources,
  };

  cacheMap.set(cacheKey, { data: result, expiresAt: ts + CACHE_TTL_MS });
  res.json(result);
});

export default router;
