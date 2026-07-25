/**
 * POST /api/discover-goal
 * Analyses a student's free-form self-description and returns AI-powered
 * career goal recommendations with detailed roadmaps.
 */

import { Router, type IRouter } from "express";
import { callAI, parseAIJson } from "../lib/ai";

const router: IRouter = Router();

interface GoalRecommendation {
  goalName: string;
  emoji: string;
  whyItMatches: string;
  requiredSkills: string[];
  futureScope: string;
  learningRoadmap: string[];
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  salaryPotential: string;
  recommendedSubjects: string[];
  matchScore: number; // 0-100
}

interface DiscoverGoalResponse {
  personalityProfile: {
    type: string;
    description: string;
    strengths: string[];
    learningPattern: string;
  };
  topRecommendations: GoalRecommendation[]; // exactly 4
  exploreMore: {
    goalName: string;
    emoji: string;
    matchPercentage: number;
    description: string;
    requiredSkills: string[];
    futureOpportunities: string[];
  }[];
}

router.post("/discover-goal", async (req, res) => {
  const { interests, classStandard, name } = req.body as {
    interests?: string;
    classStandard?: string;
    name?: string;
  };

  if (!interests || typeof interests !== "string" || interests.trim().length < 20) {
    res.status(400).json({
      error: "Please describe your interests in at least 20 characters so we can give you accurate recommendations.",
    });
    return;
  }

  const safeInterests = interests.trim().slice(0, 2000);
  const studentClass = classStandard ? `Class ${classStandard}` : "school";
  const studentName  = name ? name.trim().slice(0, 50) : "the student";

  const prompt = `You are an expert career counsellor and educational psychologist specialising in Indian students (Classes 5–12).

A ${studentClass} student named ${studentName} has written the following about themselves:
"${safeInterests}"

Analyse this deeply and return a comprehensive career guidance report in the following JSON format. 
IMPORTANT: Return ONLY valid JSON — no markdown, no code fences, no extra text.

{
  "personalityProfile": {
    "type": "e.g. Creative Problem-Solver / Analytical Thinker / Empathetic Leader",
    "description": "2-3 sentence personality summary based on what they wrote",
    "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
    "learningPattern": "e.g. Visual learner who thrives with hands-on projects"
  },
  "topRecommendations": [
    {
      "goalName": "e.g. Engineering & Technology",
      "emoji": "⚙️",
      "whyItMatches": "Specific explanation referencing what the student wrote (2-3 sentences)",
      "requiredSkills": ["Maths", "Physics", "Programming", "Problem-solving"],
      "futureScope": "Detailed paragraph about career opportunities, job market, growth",
      "learningRoadmap": [
        "Step 1: Focus on Class 9-10 Maths and Science",
        "Step 2: Learn Python basics",
        "Step 3: Prepare for JEE/competitive exams",
        "Step 4: Pursue B.Tech or Diploma",
        "Step 5: Specialise in your chosen domain"
      ],
      "difficultyLevel": "Intermediate",
      "salaryPotential": "₹4-40 LPA depending on specialisation and experience",
      "recommendedSubjects": ["Mathematics", "Physics", "Computer Science"],
      "matchScore": 92
    }
  ],
  "exploreMore": [
    {
      "goalName": "e.g. Arts & Design",
      "emoji": "🎨",
      "matchPercentage": 75,
      "description": "2-sentence description of this career path",
      "requiredSkills": ["Creativity", "Drawing", "Design thinking"],
      "futureOpportunities": ["Graphic Designer", "UI/UX Designer", "Film Director"]
    }
  ]
}

Rules:
- topRecommendations must contain EXACTLY 4 items, ranked by match quality
- exploreMore must contain 4-6 additional options with lower match scores
- Match scores in topRecommendations should be 75-98; exploreMore should be 45-74
- All recommendations must be realistic for Indian students
- Career goals should be from: Engineering & Technology, Medical & Healthcare, Arts & Design, Commerce & Business, Information Technology, Defence & Armed Forces, Government Services, Science & Research, Law & Justice, Education & Teaching, Agriculture & Environment, Architecture & Civil, Media & Journalism, Sports & Fitness, Psychology & Counselling, Social Work & NGO
- Be specific about Indian context: CBSE/state boards, JEE, NEET, UPSC, CAT, GATE etc.
- Salary figures should be in INR (₹)`;

  const raw = await callAI(prompt, 3000);

  if (!raw) {
    res.status(503).json({
      error: "AI service unavailable. Please ensure an AI API key (GROQ_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_API_KEY) is configured.",
    });
    return;
  }

  const parsed = parseAIJson<DiscoverGoalResponse>(raw);

  if (!parsed || !parsed.topRecommendations || parsed.topRecommendations.length === 0) {
    res.status(502).json({
      error: "Could not parse AI response. Please try again.",
    });
    return;
  }

  res.json(parsed);
});

export default router;
