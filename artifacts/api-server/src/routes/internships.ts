/**
 * POST /api/internships
 * Returns AI-powered internship recommendations tailored to the student's profile.
 */

import { Router, type IRouter } from "express";
import { callAI, parseAIJson } from "../lib/ai";

const router: IRouter = Router();

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

router.post("/internships", async (req, res) => {
  const { classStandard, skills, location, interests, name, selectedGoal } = req.body as {
    classStandard?: string;
    skills?: string;
    location?: string;
    interests?: string;
    name?: string;
    selectedGoal?: string;
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
  const goal = (selectedGoal || "").toString().slice(0, 100);

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

  if (!raw) {
    res.status(503).json({
      error: "AI service unavailable. Please configure an AI API key to use this feature.",
    });
    return;
  }

  const parsed = parseAIJson<InternshipsResponse>(raw);

  if (!parsed || !Array.isArray(parsed.internships)) {
    res.status(502).json({ error: "Could not parse AI response. Please try again." });
    return;
  }

  res.json(parsed);
});

export default router;
