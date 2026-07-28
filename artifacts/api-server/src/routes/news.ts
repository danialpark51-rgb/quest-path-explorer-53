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
  engineering: "engineering India student",
  medical:     "NEET medical India",
  commerce:    "business finance India student",
  arts:        "arts college India",
  it:          "technology software India",
  defence:     "UPSC defence India",
  govt:        "UPSC government India",
  default:     "education India student",
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
      q:       query,
      token:   apiKey,
      lang:    "en",
      max:     "10",
      sortby:  "publishedAt",
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
      id: `s1-${ts}`, category: "Education", emoji: "📚", date: today,
      imageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=400",
      source: "EduPath News", link: "https://jeeadv.ac.in",
      title:   "JEE Advanced 2025: IIT Kanpur Announces Registration Dates and Eligibility",
      summary: "IIT Kanpur is the organising institute for JEE Advanced 2025. Students clearing JEE Main cutoffs must register before the deadline.",
      content: "IIT Kanpur has released the official schedule for JEE Advanced 2025. Students who qualify through JEE Main merit list can apply. The exam covers Physics, Chemistry, and Mathematics at an advanced level. Only the top 2,50,000 students from JEE Main are eligible to appear. Results are typically declared within a month of the exam, after which seat allotment through JOSAA begins.",
    },
    {
      id: `s2-${ts}`, category: "Education", emoji: "🔬", date: today,
      imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400",
      source: "EduPath News", link: "https://nta.ac.in",
      title:   "NEET UG 2025: NTA Announces Exam Date — Over 24 Lakh Students to Appear",
      summary: "NTA has confirmed NEET UG 2025 exam date. Over 24 lakh candidates have registered — the highest ever for any medical entrance exam.",
      content: "The National Testing Agency has confirmed the NEET UG 2025 exam. This year sees a record 24+ lakh registrations. The exam follows a 180-question, 720-mark format across Physics, Chemistry, and Biology. The NTA has implemented multiple security measures including biometric attendance and CCTV monitoring at all exam centres to ensure integrity.",
    },
    {
      id: `s3-${ts}`, category: "Technology", emoji: "🤖", date: today,
      imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400",
      source: "EduPath News", link: null,
      title:   "India Launches National AI Mission 2025 — ₹10,300 Crore for AI Infrastructure",
      summary: "The Government of India launched the IndiaAI Mission with ₹10,371 crore to build computing infrastructure and train 1 million AI professionals by 2028.",
      content: "The IndiaAI Mission aims to democratise AI across sectors. The mission includes building a shared AI computing infrastructure, creating large-scale datasets, and training students, researchers, and startups. Under this mission, AI courses will be introduced in 5,000 schools and 200 universities. This opens massive career opportunities for Indian students in AI and machine learning roles.",
    },
    {
      id: `s4-${ts}`, category: "Scholarship", emoji: "🎓", date: today,
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400",
      source: "EduPath News", link: "https://scholarships.gov.in",
      title:   "National Scholarship Portal 2025-26: 50+ Scholarships Open for Applications",
      summary: "NSP scholarships covering pre-matric, post-matric and merit-based awards worth ₹75,000–₹1.2 lakh per year. Deadline approaching.",
      content: "The National Scholarship Portal has reopened for 2025-26 applications. More than 50 central and state government scholarships are available. Key schemes include the Central Sector Scholarship (top 0.1% in 10+2), National Means-cum-Merit Scholarship, and Post-Matric scholarships for SC/ST/OBC students. Students must apply via NSP to avoid missing out on substantial financial support.",
    },
    {
      id: `s5-${ts}`, category: "Government", emoji: "🏛️", date: today,
      imageUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400",
      source: "EduPath News", link: "https://upsc.gov.in",
      title:   "UPSC Civil Services 2025 Notification: 979 Vacancies — Check IAS, IPS, IFS Openings",
      summary: "UPSC has released Civil Services 2025 notification with 979 vacancies. Prelims scheduled for June 2025. Eligibility: Any graduate with valid nationality.",
      content: "The Union Public Service Commission has published the Civil Services Examination (CSE) 2025 notification. A total of 979 vacancies are available across IAS, IPS, IFS, IRS, and other Group A/B central services. The two-stage exam (Prelims + Mains + Interview) is spread over 9-12 months. Success rate is approximately 0.1% — rigorous preparation with a structured study plan starting early is crucial.",
    },
    {
      id: `s6-${ts}`, category: "Career", emoji: "💼", date: today,
      imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400",
      source: "EduPath News", link: null,
      title:   "IIT, NIT Placements 2025: Average Package Crosses ₹20 LPA at Top Campuses",
      summary: "IIT Bombay reports ₹23 LPA average, NIT Trichy ₹16 LPA. Software, Data Science, and Finance sectors lead hiring.",
      content: "Campus placement season 2024-25 concluded with strong results across IITs and NITs. IIT Bombay recorded an average CTC of ₹23 LPA, while NITs averaged ₹16 LPA. Top recruiters include Microsoft, Google, Amazon, Goldman Sachs, and Qualcomm. AI/ML engineers commanded the highest packages, followed by software development and quantitative finance roles. Students should focus on competitive programming, system design, and core subjects.",
    },
    {
      id: `s7-${ts}`, category: "Science", emoji: "🚀", date: today,
      imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400",
      source: "EduPath News", link: "https://isro.gov.in",
      title:   "ISRO Gaganyaan Mission Update 2025 — India's First Crewed Space Mission",
      summary: "ISRO's Gaganyaan human spaceflight mission is on track for 2025. Test vehicle flights have been completed successfully.",
      content: "India's historic Gaganyaan mission aims to send three Indian astronauts to space for a 3-day mission in Low Earth Orbit. The selected astronauts (Shubhanshu Shukla, Prashanth Nair, Ajit Krishnan, and Angad Pratap) have completed training in Russia. This mission positions India as one of only four countries (USA, Russia, China) to have independent human spaceflight capability — opening massive careers in aerospace engineering.",
    },
    {
      id: `s8-${ts}`, category: "Education", emoji: "📝", date: today,
      imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400",
      source: "EduPath News", link: "https://cbse.gov.in",
      title:   "CBSE Introduces Two-Level Maths & New AI Elective in 2025-26 Curriculum",
      summary: "CBSE rolls out two-level Mathematics (Standard/Basic) for Class 10 and a new Artificial Intelligence elective for Class 11 & 12.",
      content: "CBSE has announced significant curriculum updates for 2025-26. Class 10 students can now choose between Mathematics Standard (for students targeting engineering/science) and Mathematics Basic (for arts/commerce aspirants). A new AI elective has been introduced for senior secondary, covering machine learning, neural networks, and Python programming. The board has also reduced rote learning, shifting to more competency-based assessment.",
    },
    {
      id: `s9-${ts}`, category: "Career", emoji: "🌏", date: today,
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400",
      source: "EduPath News", link: null,
      title:   "India's IT Sector to Create 3.5 Lakh New Jobs in 2025 — NASSCOM Report",
      summary: "NASSCOM projects strong tech hiring. AI, Cloud, Cybersecurity, and Data Analytics are the top in-demand skills.",
      content: "India's IT industry is set for robust growth in 2025. NASSCOM's annual report projects 3.5 lakh new technology jobs with 60% focusing on AI-augmented roles. The report highlights that candidates with skills in Generative AI, Cloud Architecture (AWS/Azure/GCP), and Cybersecurity command 40-60% salary premiums. Students should upskill in these domains alongside their core engineering education to maximise placement prospects.",
    },
    {
      id: `s10-${ts}`, category: "Education", emoji: "🏆", date: today,
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400",
      source: "EduPath News", link: null,
      title:   "India's IISc Bangalore Enters Top 150 Global Universities — QS Rankings 2025",
      summary: "IISc Bangalore climbs to 130th position in QS World University Rankings 2025. IIT Bombay ranks 118th globally.",
      content: "Indian institutions have made significant gains in the QS World University Rankings 2025. IIT Bombay leads Indian universities at rank 118, followed by IIT Delhi at 150 and IISc Bangalore at 130. These rankings reflect India's improving research output, international faculty ratio, and employer reputation. Students at these institutions have exceptional placement opportunities with top global companies actively recruiting from Indian campuses.",
    },
    {
      id: `s11-${ts}`, category: "Education", emoji: "📊", date: today,
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
      source: "EduPath News", link: "https://cuet.samarth.ac.in",
      title:   "CUET UG 2025: Central University Admission Test — Dates and Syllabus",
      summary: "CUET UG 2025 registration is open. Scores accepted by all Central Universities including Delhi University, BHU, JNU, and Jamia.",
      content: "The Common University Entrance Test (CUET) UG 2025 offers admission to over 260 universities including all Central Universities, many State Universities, and Deemed-to-be Universities. The test covers domain-specific subjects, General Test (Aptitude/Reasoning/GK), and Languages. Unlike board percentages, CUET scores are the primary admission criterion, making it essential for all Class 12 students targeting top universities.",
    },
    {
      id: `s12-${ts}`, category: "Technology", emoji: "💡", date: today,
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      source: "EduPath News", link: null,
      title:   "India Digital Literacy Mission: 5 Crore Rural Students to Get Tech Training",
      summary: "PM e-VIDYA and PM-POSHAN expanded to train 5 crore rural students in digital skills, coding, and e-learning by 2027.",
      content: "The Government of India has expanded the PM e-VIDYA initiative to reach 5 crore rural students. The programme provides free access to quality digital education content, coding bootcamps, and e-learning platforms via community learning centres. One-rank-one-TV channels broadcast educational content in 12 regional languages. This initiative aims to bridge the rural-urban education divide and create equal opportunities for all Indian students.",
    },
  ];

  // Goal-specific ordering — surfaces most relevant articles first
  if (goal === "engineering" || goal === "it" || goal === "software-engineer" || goal === "ai-engineer" || goal === "data-scientist" || goal === "cybersecurity" || goal === "mechanical" || goal === "civil") {
    // Tech/Engineering: AI Mission, JEE, IT Jobs, IISc Rankings, ISRO, Scholarships, CUET, Digital Literacy, NEET, CBSE
    return [base[2], base[0], base[8], base[9], base[6], base[3], base[10], base[11], base[5], base[7], base[4], base[1]];
  }
  if (goal === "medical") {
    // Medical: NEET, Scholarships, ISRO, JEE, AI Mission, UPSC, CBSE, Placements, IT Jobs, Rankings
    return [base[1], base[3], base[6], base[0], base[2], base[4], base[7], base[5], base[8], base[9], base[10], base[11]];
  }
  if (goal === "govt" || goal === "defence") {
    // Govt/Defence: UPSC, CBSE, JEE, Scholarships, Rankings, AI Mission, ISRO, CUET, Placements, NEET
    return [base[4], base[7], base[0], base[3], base[9], base[2], base[6], base[10], base[5], base[1], base[8], base[11]];
  }
  if (goal === "commerce" || goal === "ca" || goal === "entrepreneur") {
    // Commerce: Placements, Scholarships, Rankings, UPSC, JEE, AI Mission, IT Jobs, CBSE, NEET, ISRO
    return [base[5], base[3], base[9], base[4], base[0], base[2], base[8], base[7], base[1], base[6], base[10], base[11]];
  }
  if (goal === "arts") {
    // Arts: CUET, CBSE, Scholarships, Rankings, AI Mission, Digital Literacy, Placements, UPSC, JEE, NEET
    return [base[10], base[7], base[3], base[9], base[2], base[11], base[5], base[4], base[0], base[1], base[8], base[6]];
  }
  return base;
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/news", async (req, res) => {
  const newsDataKey = process.env.NEWSDATA_API_KEY;
  const gnewsKey    = process.env.GNEWS_API_KEY;

  const goal     = String(req.query.goal     ?? "default");
  const language = String(req.query.language ?? "en");
  const nocache  = req.query.nocache === "1";
  const query    = GOAL_QUERIES[goal] ?? GOAL_QUERIES.default;
  const cacheKey = `${goal}:${language}`;

  // Serve from cache if still fresh (skip when nocache=1 for manual refresh)
  const cached = cacheMap.get(cacheKey);
  if (!nocache && cached && Date.now() < cached.expiresAt) {
    res.json(cached.data);
    return;
  }

  // Invalidate stale cache entry so we always fetch fresh on manual refresh
  if (nocache) cacheMap.delete(cacheKey);

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
