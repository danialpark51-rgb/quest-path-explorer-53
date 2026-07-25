/**
 * POST /api/scholarships
 * Returns AI-powered scholarship recommendations tailored to the student's profile.
 */

import { Router, type IRouter } from "express";
import { callAI, parseAIJson } from "../lib/ai";

const router: IRouter = Router();

interface Scholarship {
  name: string;
  emoji: string;
  eligibility: string;
  amount: string;
  deadline: string;
  officialWebsite: string;
  requiredDocuments: string[];
  selectionProcess: string;
  applicationGuide: string[];
  locationEligibility: string;
  importantNotes: string;
  category: "Central Government" | "State Government" | "Private" | "NGO" | "International";
  matchScore: number;
}

interface ScholarshipsResponse {
  summary: string;
  scholarships: Scholarship[];
  tips: string[];
}

router.post("/scholarships", async (req, res) => {
  const { classStandard, skills, location, interests, name } = req.body as {
    classStandard?: string;
    skills?: string;
    location?: string;
    interests?: string;
    name?: string;
  };

  if (!classStandard) {
    res.status(400).json({ error: "Class/Standard is required." });
    return;
  }

  const studentName  = (name || "the student").toString().slice(0, 50);
  const studentClass = classStandard.toString().slice(0, 10);
  const studentLoc   = (location || "India").toString().slice(0, 100);
  const studentSkills = (skills || "").toString().slice(0, 500);
  const studentInterests = (interests || "").toString().slice(0, 500);

  const prompt = `You are an expert Indian education counsellor with deep knowledge of scholarships available to school and college students in India.

Student Profile:
- Name: ${studentName}
- Class/Standard: ${studentClass}
- Location: ${studentLoc}
- Skills: ${studentSkills || "Not specified"}
- Interests: ${studentInterests || "Not specified"}

Generate a list of REAL, OFFICIAL scholarships available to this student. Return ONLY valid JSON — no markdown, no code fences.

{
  "summary": "2-sentence personalised message about scholarship opportunities for this student",
  "scholarships": [
    {
      "name": "National Means-cum-Merit Scholarship (NMMS)",
      "emoji": "🏆",
      "eligibility": "Specific eligibility criteria including class, income, marks requirements",
      "amount": "₹12,000 per year",
      "deadline": "Usually October-November (check official site for current year)",
      "officialWebsite": "https://scholarships.gov.in",
      "requiredDocuments": [
        "Aadhaar Card",
        "Income Certificate",
        "Previous year marksheet",
        "Bank passbook",
        "Caste certificate (if applicable)"
      ],
      "selectionProcess": "Written exam / Merit-based / Interview process description",
      "applicationGuide": [
        "Step 1: Visit the official website",
        "Step 2: Register with your Aadhaar number",
        "Step 3: Fill in academic details",
        "Step 4: Upload required documents",
        "Step 5: Submit before the deadline",
        "Step 6: Track application status online"
      ],
      "locationEligibility": "All India / Specific states",
      "importantNotes": "Key things to know — renewal conditions, income limits, etc.",
      "category": "Central Government",
      "matchScore": 90
    }
  ],
  "tips": [
    "Apply to multiple scholarships simultaneously",
    "Keep all documents ready in digital format",
    "Check NSP (National Scholarship Portal) for centralized applications"
  ]
}

Rules:
- Include 6-8 REAL scholarships that genuinely exist and are relevant to Class ${studentClass} students
- Only include genuine, official scholarships — NO fake or invented ones
- Include a mix: government (central + state), private foundations, NGO scholarships
- Prioritise by matchScore (highest first)
- Always include NSP (scholarships.gov.in) based ones for Classes 9-12
- For Class 5-8: NMMS, Pre-Matric scholarships, state scholarships
- For Class 9-10: NMMS, Pre-Matric, NSP scholarships, Inspire
- For Class 11-12: Post-Matric, INSPIRE, Central Sector Scheme, private scholarships
- Include location-specific ones if ${studentLoc} is a specific state
- Real websites only (scholarships.gov.in, buddy4study.com, etc.)`;

  const raw = await callAI(prompt, 3000);

  if (!raw) {
    res.status(503).json({
      error: "AI service unavailable. Please configure an AI API key to use this feature.",
    });
    return;
  }

  const parsed = parseAIJson<ScholarshipsResponse>(raw);

  if (!parsed || !Array.isArray(parsed.scholarships)) {
    res.status(502).json({ error: "Could not parse AI response. Please try again." });
    return;
  }

  res.json(parsed);
});

export default router;
