/**
 * POST /api/internships
 * Returns internship opportunities for Indian students.
 *
 * Strategy:
 * 1. If ADZUNA_APP_ID + ADZUNA_APP_KEY are set, fetch real listings from Adzuna
 * 2. Merge Adzuna results with AI-generated recommendations
 * 3. If Adzuna not available, fall back to AI-only recommendations
 */

import { Router, type IRouter } from "express";
import { callAI, parseAIJson } from "../lib/ai";

const router: IRouter = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

interface Internship {
  name: string;
  emoji: string;
  company: string;
  location: string;
  mode: "Online" | "Offline" | "Hybrid";
  requiredSkills: string[];
  duration: string;
  stipend: string;
  officialWebsite: string;
  applicationGuide: string[];
  eligibility: string;
  lastDate: string;
  description: string;
  category: string;
  matchScore: number;
}

interface InternshipsResponse {
  summary: string;
  internships: Internship[];
  platforms: { name: string; url: string; description: string }[];
  tips: string[];
}

// ─── Adzuna API ───────────────────────────────────────────────────────────────

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  category: { label: string; tag: string };
  company: { display_name: string };
  location: { display_name: string; area?: string[] };
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
  created: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

async function fetchAdzunaJobs(
  what: string,
  where: string,
  category?: string,
): Promise<AdzunaJob[] | null> {
  const appId  = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return null;

  try {
    const params = new URLSearchParams({
      app_id:           appId,
      app_key:          appKey,
      results_per_page: "10",
      what:             what,
      ...(where  ? { where }    : {}),
      ...(category ? { category } : {}),
      "content-type": "application/json",
    });

    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?${params.toString()}`;
    const r = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });

    if (!r.ok) {
      console.warn(`[internships] Adzuna HTTP ${r.status}`);
      return null;
    }

    const data = await r.json() as AdzunaResponse;
    return data.results ?? null;
  } catch (e) {
    console.warn("[internships] Adzuna fetch error:", (e as Error).message);
    return null;
  }
}

function adzunaToInternship(job: AdzunaJob, idx: number): Internship {
  const stipend =
    job.salary_min && job.salary_max
      ? `₹${Math.round(job.salary_min / 12).toLocaleString()}–${Math.round(job.salary_max / 12).toLocaleString()}/month`
      : job.salary_min
      ? `₹${Math.round(job.salary_min / 12).toLocaleString()}/month`
      : "Stipend varies";

  const isRemote =
    (job.contract_time === "part_time" || job.location.display_name.toLowerCase().includes("remote") || job.description.toLowerCase().includes("remote"));

  const categoryEmojis: Record<string, string> = {
    "it-jobs": "💻", "engineering-jobs": "⚙️", "teaching-jobs": "📚",
    "healthcare-nursing-jobs": "🏥", "scientific-qa-jobs": "🔬",
    "finance-jobs": "💹", "creative-design-jobs": "🎨",
    "sales-jobs": "📈", "marketing-jobs": "📣",
  };

  return {
    name:             job.title.slice(0, 80),
    emoji:            categoryEmojis[job.category.tag] ?? "💼",
    company:          job.company.display_name,
    location:         job.location.display_name,
    mode:             isRemote ? "Online" : "Offline",
    requiredSkills:   [],
    duration:         job.contract_time === "part_time" ? "Part-time" : "Full-time / Internship",
    stipend,
    officialWebsite:  job.redirect_url,
    applicationGuide: [
      "Visit the official job listing via the link below",
      "Create or update your resume/CV",
      "Submit your application through the official portal",
      "Follow up with the hiring team if no response in 2 weeks",
    ],
    eligibility:  `${job.category.label} role — check the official listing for specific requirements`,
    lastDate:     "Check official listing",
    description:  job.description.slice(0, 400).replace(/<[^>]*>/g, ""),
    category:     job.category.label,
    matchScore:   Math.max(60, 90 - idx * 3),
  };
}

// ─── AI Generation ────────────────────────────────────────────────────────────

async function generateAIInternships(
  studentName: string,
  studentClass: string,
  studentLoc: string,
  studentSkills: string,
  studentInterests: string,
  goal: string,
): Promise<InternshipsResponse | null> {
  const prompt = `You are an expert career counsellor helping Indian school students (Classes 5–12) find internship opportunities.

Student Profile:
- Name: ${studentName}
- Class/Standard: ${studentClass}
- Location: ${studentLoc}
- Skills: ${studentSkills || "Not specified"}
- Interests/Goal: ${studentInterests || goal || "Not specified"}

Generate a list of REAL internship and hands-on learning opportunities suitable for Class ${studentClass} students in India. Return ONLY valid JSON — no markdown, no code fences.

{
  "summary": "2-sentence personalised message about internship opportunities for this student",
  "internships": [
    {
      "name": "Summer Research Fellowship for Students",
      "emoji": "🔬",
      "company": "Indian Academy of Sciences (IASc)",
      "location": "Bangalore / Multiple cities",
      "mode": "Offline",
      "requiredSkills": ["Science basics", "Curiosity", "Report writing"],
      "duration": "2 months (May-June)",
      "stipend": "₹5,000-10,000/month",
      "officialWebsite": "https://www.ias.ac.in/",
      "applicationGuide": [
        "Step 1: Visit the official IASc website",
        "Step 2: Download the application form",
        "Step 3: Get recommendation letter from school teacher",
        "Step 4: Submit application with marksheets",
        "Step 5: Wait for selection notification"
      ],
      "eligibility": "Class 11-12 students with strong Science background",
      "lastDate": "February-March (check website for exact dates)",
      "description": "Work alongside senior scientists at premier research institutions across India",
      "category": "Science & Research",
      "matchScore": 88
    }
  ],
  "platforms": [
    {
      "name": "Internshala",
      "url": "https://internshala.com",
      "description": "India's largest internship platform with student-friendly opportunities"
    },
    {
      "name": "LinkedIn",
      "url": "https://linkedin.com",
      "description": "Professional network with internship listings from top companies"
    },
    {
      "name": "Youth4Work",
      "url": "https://youth4work.com",
      "description": "Platform for student internships and part-time opportunities"
    }
  ],
  "tips": [
    "Build a simple portfolio or project to showcase your skills",
    "Create a LinkedIn profile even as a student",
    "Apply to virtual/online internships first to build experience"
  ]
}

Rules:
- Include 5-7 REAL internship programs/opportunities suitable for school students
- For Classes 5-8: Focus on summer programs, workshops, and skill-building programs
- For Classes 9-10: Include CBSE activity points programs, science fairs, coding bootcamps
- For Classes 11-12: Real internship programs from ISRO, IITs, IIMs, corporates, NGOs
- Include platforms like Internshala, LinkedIn, AIESEC for finding more
- Mix of online and offline opportunities
- Real companies and organizations only
- Stipend info should be honest (many school internships are unpaid)
- Include IIT, IISc, government programs where applicable
- Tailor to the student's interests and location if specified`;

  const raw = await callAI(prompt, 3000);
  if (!raw) return null;
  return parseAIJson<InternshipsResponse>(raw);
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/internships", async (req, res) => {
  const {
    classStandard,
    skills,
    location,
    interests,
    name,
    selectedGoal,
    category,
    remote,
  } = req.body as {
    classStandard?: string;
    skills?: string;
    location?: string;
    interests?: string;
    name?: string;
    selectedGoal?: string;
    category?: string;
    remote?: boolean;
  };

  if (!classStandard) {
    res.status(400).json({ error: "Class/Standard is required." });
    return;
  }

  const studentName      = (name || "the student").toString().slice(0, 50);
  const studentClass     = classStandard.toString().slice(0, 10);
  const studentLoc       = (location || "India").toString().slice(0, 100);
  const studentSkills    = (skills || "").toString().slice(0, 500);
  const studentInterests = (interests || "").toString().slice(0, 500);
  const goal             = (selectedGoal || "").toString().slice(0, 100);

  // Build Adzuna search query from interests/goal/skills
  const searchQuery = [goal, studentInterests, studentSkills]
    .filter(Boolean)
    .join(" ")
    .slice(0, 200) || "internship trainee";

  // Fetch from Adzuna and AI in parallel
  const [adzunaJobs, aiResult] = await Promise.all([
    fetchAdzunaJobs(
      searchQuery,
      remote ? "" : studentLoc,
      category,
    ),
    generateAIInternships(studentName, studentClass, studentLoc, studentSkills, studentInterests, goal),
  ]);

  // Build response
  let internships: Internship[] = [];
  const platforms = aiResult?.platforms ?? [
    { name: "Internshala", url: "https://internshala.com", description: "India's largest internship platform" },
    { name: "LinkedIn",    url: "https://linkedin.com",    description: "Professional network with internship listings" },
    { name: "Youth4Work",  url: "https://youth4work.com",  description: "Platform for student internships" },
  ];
  const tips = aiResult?.tips ?? [];

  // Adzuna jobs first (real listings), then AI suggestions
  if (adzunaJobs && adzunaJobs.length > 0) {
    internships = adzunaJobs.map(adzunaToInternship);
    console.log(`[internships] Fetched ${internships.length} jobs from Adzuna`);
  }
  if (aiResult?.internships) {
    // Append AI results (avoid duplicates by company name)
    const existingCompanies = new Set(internships.map((i) => i.company.toLowerCase()));
    const aiOnly = aiResult.internships.filter(
      (i) => !existingCompanies.has(i.company.toLowerCase()),
    );
    internships = [...internships, ...aiOnly];
  }

  if (internships.length === 0) {
    res.status(503).json({
      error: "Unable to find internships right now. Please configure an AI API key or Adzuna API credentials.",
    });
    return;
  }

  // Apply filters
  let filtered = internships;
  if (remote) {
    filtered = filtered.filter((i) => i.mode === "Online" || i.mode === "Hybrid");
  }
  if (category) {
    const cat = category.toLowerCase();
    const catFiltered = filtered.filter((i) => i.category.toLowerCase().includes(cat));
    if (catFiltered.length > 0) filtered = catFiltered;
  }

  const summary =
    aiResult?.summary ??
    `Found ${filtered.length} internship${filtered.length !== 1 ? "s" : ""} tailored for Class ${studentClass} students${studentLoc !== "India" ? ` in ${studentLoc}` : ""}.`;

  res.json({ summary, internships: filtered, platforms, tips });
});

export default router;
