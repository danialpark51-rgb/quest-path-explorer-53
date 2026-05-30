/**
 * AI Study Planner
 *
 * POST /api/study-planner
 * Body: { goal, examDate, currentLevel, dailyHours, weakSubjects }
 *
 * Generates a personalised week-by-week study schedule using Groq (llama3).
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudyTask {
  day:      string;   // "Mon" | "Tue" etc.
  subject:  string;
  topic:    string;
  duration: string;   // e.g. "1.5h"
  tip:      string;
}

interface StudyWeek {
  week:    number;
  title:   string;
  theme:   string;
  tasks:   StudyTask[];
}

interface PlannerRequest {
  goal:          string;   // "engineering" | "medical" | ...
  examDate:      string;   // ISO date string
  currentLevel:  string;   // "beginner" | "intermediate" | "advanced"
  dailyHours:    number;   // 1–8
  weakSubjects:  string[]; // ["Physics", "Maths", ...]
}

// ─── Goal → exam name mapping ─────────────────────────────────────────────────

const EXAM_NAMES: Record<string, string> = {
  engineering: "JEE / CET",
  medical:     "NEET",
  commerce:    "CA Foundation / Class 12 Boards",
  arts:        "Class 12 Boards / BA Entrance",
  it:          "Tech Placement / Coding Interview",
  defence:     "NDA / CDS",
  govt:        "UPSC / SSC / State PSC",
};

const GOAL_SUBJECTS: Record<string, string[]> = {
  engineering: ["Physics", "Chemistry", "Mathematics", "Problem Solving"],
  medical:     ["Biology", "Chemistry", "Physics", "NEET Revision"],
  commerce:    ["Accountancy", "Economics", "Business Studies", "Maths"],
  arts:        ["History", "Geography", "Literature", "Political Science"],
  it:          ["Data Structures", "Algorithms", "System Design", "Coding Practice"],
  defence:     ["Mathematics", "English", "General Knowledge", "Physical Fitness"],
  govt:        ["History", "Polity", "Economy", "Current Affairs"],
};

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/study-planner", async (req, res) => {
  const body = req.body as Partial<PlannerRequest>;

  const goal         = body.goal          ?? "engineering";
  const examDate     = body.examDate      ?? "";
  const currentLevel = body.currentLevel  ?? "intermediate";
  const dailyHours   = Math.min(8, Math.max(1, Number(body.dailyHours ?? 3)));
  const weakSubjects = Array.isArray(body.weakSubjects) ? body.weakSubjects : [];

  // Compute weeks remaining
  const msPerWeek  = 7 * 24 * 60 * 60 * 1000;
  const now        = Date.now();
  const examMs     = examDate ? new Date(examDate).getTime() : now + 12 * 4 * msPerWeek;
  const weeksLeft  = Math.max(1, Math.round((examMs - now) / msPerWeek));
  const planWeeks  = Math.min(weeksLeft, 6);  // cap at 6 weeks (keeps JSON under token limit)

  const examName    = EXAM_NAMES[goal] ?? "Board Exams";
  const subjects    = GOAL_SUBJECTS[goal] ?? ["Core Subject", "Revision", "Practice", "Current Affairs"];
  const weakStr     = weakSubjects.length > 0 ? weakSubjects.join(", ") : "none specified";

  const prompt = `You are an expert Indian study coach. Create a detailed ${planWeeks}-week study plan for a student preparing for ${examName}.

Student profile:
- Goal: ${goal} (${examName})
- Exam date: ${examDate || "approximately " + planWeeks + " weeks away"}
- Current level: ${currentLevel}
- Daily study hours available: ${dailyHours} hours
- Weak subjects: ${weakStr}
- Core subjects: ${subjects.join(", ")}

Rules:
1. Return ONLY valid JSON, no markdown, no explanation outside JSON.
2. Structure: { "weeks": [ { "week": 1, "title": "string", "theme": "string", "tasks": [ { "day": "Mon", "subject": "string", "topic": "string", "duration": "string", "tip": "string" } ] } ] }
3. Each week has 6 tasks (Mon–Sat, Sunday is rest — do NOT include Sunday).
4. Distribute subjects evenly; give extra sessions to weak subjects.
5. Early weeks = foundation; later weeks = revision + mock tests.
6. duration format: "1h", "1.5h", "2h" etc. matching the daily hours limit.
7. tip: one short, actionable study tip for that topic (max 15 words).
8. title: catchy week title like "Foundation Sprint" or "Chemistry Deep Dive".
9. theme: one sentence describing the week's focus.
10. Generate all ${planWeeks} weeks. Each week object must include all 6 tasks.`;

  const groqKey = process.env.GROQ_API_KEY;

  // ── Try Groq first ───────────────────────────────────────────────────────
  if (groqKey) {
    try {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model:       "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens:  6000,
          messages: [
            { role: "system", content: "You are a study plan generator. Output ONLY valid JSON with no markdown fences. Do not add any explanation or text outside the JSON object." },
            { role: "user",   content: prompt },
          ],
        }),
      });

      if (resp.ok) {
        const data = await resp.json() as { choices?: { message?: { content?: string } }[] };
        const raw  = data.choices?.[0]?.message?.content?.trim() ?? "";

        // Strip any accidental markdown fences
        const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");

        try {
          const plan = JSON.parse(cleaned) as { weeks: StudyWeek[] };
          if (Array.isArray(plan.weeks) && plan.weeks.length > 0) {
            res.json({ ...plan, goal, examDate, weeksLeft, planWeeks, examName });
            return;
          }
        } catch {
          console.error("[study-planner] JSON parse error from Groq:", cleaned.slice(0, 200));
        }
      }
    } catch (err) {
      console.error("[study-planner] Groq request failed:", err);
    }
  }

  // ── Fallback: Replit AI ──────────────────────────────────────────────────
  const replitKey  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

  if (replitKey && replitBase) {
    try {
      const resp = await fetch(`${replitBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${replitKey}`,
        },
        body: JSON.stringify({
          model:       "gpt-4o-mini",
          temperature: 0.7,
          max_tokens:  4000,
          messages: [
            { role: "system", content: "You are a study plan generator. Output ONLY valid JSON with no markdown fences." },
            { role: "user",   content: prompt },
          ],
        }),
      });

      if (resp.ok) {
        const data = await resp.json() as { choices?: { message?: { content?: string } }[] };
        const raw  = data.choices?.[0]?.message?.content?.trim() ?? "";
        const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");

        try {
          const plan = JSON.parse(cleaned) as { weeks: StudyWeek[] };
          if (Array.isArray(plan.weeks) && plan.weeks.length > 0) {
            res.json({ ...plan, goal, examDate, weeksLeft, planWeeks, examName });
            return;
          }
        } catch {
          console.error("[study-planner] JSON parse error from Replit AI");
        }
      }
    } catch (err) {
      console.error("[study-planner] Replit AI request failed:", err);
    }
  }

  res.status(503).json({ error: "AI service unavailable. Please try again." });
});

export default router;
