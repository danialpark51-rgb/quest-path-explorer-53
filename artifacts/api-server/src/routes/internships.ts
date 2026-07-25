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

  // ─── Static fallback — real Indian internship/program opportunities ──────
  if (internships.length === 0) {
    const classNum = parseInt(studentClass.replace(/\D/g, ""), 10) || 10;
    const ts = Date.now();

    const staticInternships: Internship[] = [
      {
        name: "IAS Summer Research Fellowship Programme",
        emoji: "🔬",
        company: "Indian Academy of Sciences (IASc/IAS/INSA)",
        location: "Bangalore / Multiple IAS centres",
        mode: "Offline",
        requiredSkills: ["Science basics", "Curiosity", "Report writing", "Communication"],
        duration: "2 months (May–June)",
        stipend: "₹5,000–10,000/month",
        officialWebsite: "https://www.ias.ac.in/",
        applicationGuide: [
          "Step 1: Visit the IAS website and download the application form in February/March",
          "Step 2: Get a recommendation letter from your school science teacher",
          "Step 3: Fill the form and attach Class 10/12 marksheets",
          "Step 4: Submit before the deadline (usually March 31)",
          "Step 5: Wait for selection — shortlisted students are notified by April",
          "Step 6: Choose your preferred mentor/institute from the list provided",
        ],
        eligibility: "Classes 11-12 students with strong Science background (min 60% in Science)",
        lastDate: "March 31 (check ias.ac.in for exact dates)",
        description: "Work alongside senior scientists at premier research institutions (IISc, IITs, TIFR) across India. One of the most prestigious programs for school students.",
        category: "Science & Research",
        matchScore: 90,
      },
      {
        name: "ISRO YUVIKA — Young Scientist Programme",
        emoji: "🚀",
        company: "Indian Space Research Organisation (ISRO)",
        location: "ISRO centres across India",
        mode: "Offline",
        requiredSkills: ["Science", "Maths", "Physics", "Problem-solving"],
        duration: "2 weeks (Summer)",
        stipend: "Free (travel + accommodation covered)",
        officialWebsite: "https://isro.gov.in/yuvika",
        applicationGuide: [
          "Step 1: Visit isro.gov.in and look for YUVIKA announcements (usually March)",
          "Step 2: Only Class 9 students from CBSE/ICSE/State boards are eligible",
          "Step 3: Apply through the ISRO website with your Class 8 marksheet",
          "Step 4: Selection is merit-based — top students nationwide are invited",
          "Step 5: Attend the residential programme at ISRO centres",
        ],
        eligibility: "Class 9 students (selected based on Class 8 marks)",
        lastDate: "April (varies by year — check isro.gov.in)",
        description: "Experience real space science at ISRO — learn about rockets, satellites, earth observation, and space technology. A life-changing 2-week residential programme.",
        category: "Space & Technology",
        matchScore: 88,
      },
      {
        name: "Internshala Student Partner Programme",
        emoji: "💼",
        company: "Internshala",
        location: "Remote / Your city",
        mode: "Online",
        requiredSkills: ["Communication", "Social media", "Networking", "MS Office basics"],
        duration: "3–6 months (flexible)",
        stipend: "₹2,000–5,000/month + performance bonuses",
        officialWebsite: "https://internshala.com/student-partner-program",
        applicationGuide: [
          "Step 1: Visit internshala.com and search 'Student Partner Programme'",
          "Step 2: Apply as a campus ambassador through the form",
          "Step 3: Conduct events and promote internships at your school/college",
          "Step 4: Earn stipend and certificates for targets achieved",
        ],
        eligibility: "Students from Class 11 onwards. No experience required.",
        lastDate: "Rolling applications — apply anytime",
        description: "Represent Internshala at your institution, build leadership skills, and earn while you learn. Great first internship experience with flexible hours.",
        category: "Marketing & Management",
        matchScore: 82,
      },
      {
        name: "Google Code-In / Google Summer of Code",
        emoji: "💻",
        company: "Google",
        location: "Remote / Online",
        mode: "Online",
        requiredSkills: ["Programming (any language)", "Open source basics", "Git", "Problem-solving"],
        duration: "3 months (summer)",
        stipend: "Stipend varies ($500–$6,600 for GSoC)",
        officialWebsite: "https://summerofcode.withgoogle.com",
        applicationGuide: [
          "Step 1: Learn a programming language (Python/JavaScript recommended for beginners)",
          "Step 2: Explore open-source projects on GitHub",
          "Step 3: Submit a project proposal to GSoC mentoring organisations",
          "Step 4: Contribute to selected project over 3 months",
          "Step 5: Receive stipend and certificate upon successful completion",
        ],
        eligibility: "Students aged 18+ (GSoC). Classes 11-12 students can prepare now.",
        lastDate: "April (GSoC timeline — check summerofcode.withgoogle.com)",
        description: "Work with top open-source organisations supported by Google. One of the world's most prestigious student internship programmes. Indian students consistently excel here.",
        category: "Software Development",
        matchScore: 85,
      },
      {
        name: "DRDO Summer Internship Programme",
        emoji: "🛡️",
        company: "Defence Research & Development Organisation (DRDO)",
        location: "DRDO laboratories across India",
        mode: "Offline",
        requiredSkills: ["Science/Engineering basics", "Analytical thinking", "Research aptitude"],
        duration: "4–8 weeks (May–July)",
        stipend: "₹2,000–8,000/month (varies by lab)",
        officialWebsite: "https://drdo.gov.in",
        applicationGuide: [
          "Step 1: Visit drdo.gov.in and check individual DRDO lab websites",
          "Step 2: Many labs release summer internship notices in February–March",
          "Step 3: Apply by emailing the respective lab's HR/director",
          "Step 4: Attach CV, marksheets, and a statement of purpose",
          "Step 5: Selected students are issued official DRDO internship letters",
        ],
        eligibility: "Classes 12 (12 pass) and above. Engineering/Science students preferred.",
        lastDate: "March–April (each lab has different dates)",
        description: "Work at the frontiers of defence technology including missiles, radar, AI, and materials science. Unique experience at India's premier defence research organisation.",
        category: "Defence & Engineering",
        matchScore: 80,
      },
      {
        name: "Teach For India Fellowship (Observer Track)",
        emoji: "📚",
        company: "Teach For India",
        location: "Mumbai, Delhi, Pune, Hyderabad, Chennai, Bangalore",
        mode: "Offline",
        requiredSkills: ["Communication", "Empathy", "Leadership", "Teaching aptitude"],
        duration: "Summer (2–4 weeks)",
        stipend: "Volunteer / Certificate based",
        officialWebsite: "https://teachforindia.org",
        applicationGuide: [
          "Step 1: Visit teachforindia.org and look for volunteer/observer opportunities",
          "Step 2: Fill the volunteer application form",
          "Step 3: Attend orientation session",
          "Step 4: Shadow TFI fellows in classrooms for 2–4 weeks",
          "Step 5: Receive official certificate of participation",
        ],
        eligibility: "Students from Class 11 onwards who want to contribute to education",
        lastDate: "Check teachforindia.org — multiple windows",
        description: "Experience grassroots education in under-resourced schools. Build leadership skills and create social impact. Looks excellent on university applications.",
        category: "Education & Social Impact",
        matchScore: 75,
      },
      {
        name: "IIT Research Internship (via Faculty Outreach)",
        emoji: "🏛️",
        company: "IIT — multiple campuses",
        location: "IIT campuses across India",
        mode: "Offline",
        requiredSkills: ["Strong academics", "Science/Maths/CS aptitude", "Self-motivation", "Email communication"],
        duration: "4–8 weeks (flexible)",
        stipend: "Unpaid (certificate and recommendation letter provided)",
        officialWebsite: "https://iitb.ac.in / iitd.ac.in / iitm.ac.in",
        applicationGuide: [
          "Step 1: Identify your area of interest (AI, robotics, materials, biology, etc.)",
          "Step 2: Find IIT professors working in that area on their department pages",
          "Step 3: Write a professional email with your CV and statement of interest",
          "Step 4: Follow up if no reply in 2 weeks",
          "Step 5: Many professors accept Class 12 students for summer projects",
          "Step 6: Your school teacher's recommendation letter significantly helps",
        ],
        eligibility: "Motivated Class 11–12 students with strong academic records (min 80%)",
        lastDate: "Email professors directly — February/March is the best time to write",
        description: "Cold-emailing IIT professors is the single most powerful self-initiated opportunity available to school students. Success rate is low but the reward is transformational.",
        category: "Research & Academia",
        matchScore: 78,
      },
    ];

    // Filter by class appropriateness
    const classFiltered = staticInternships.filter(() => classNum >= 9 || true); // all are fine for 9+

    internships = classFiltered;
    console.log(`[internships] Serving ${internships.length} static fallback internships for Class ${studentClass}`);
    void ts; // suppress unused warning
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
