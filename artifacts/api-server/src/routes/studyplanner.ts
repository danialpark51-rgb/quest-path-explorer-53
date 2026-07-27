/**
 * AI Study Planner
 *
 * POST /api/study-planner
 * Body: { goal, examDate, currentLevel, dailyHours, weakSubjects }
 *
 * Generates a personalised week-by-week study schedule.
 * Falls back to a well-structured static plan when all AI providers are unavailable.
 */

import { Router, type IRouter } from "express";
import { callAI, parseAIJson } from "../lib/ai";

const router: IRouter = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudyTask {
  day:      string;
  subject:  string;
  topic:    string;
  duration: string;
  tip:      string;
}

interface StudyWeek {
  week:    number;
  title:   string;
  theme:   string;
  tasks:   StudyTask[];
}

interface PlannerRequest {
  goal:          string;
  examDate:      string;
  currentLevel:  string;
  dailyHours:    number;
  weakSubjects:  string[];
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

// ─── Static fallback plan generator ──────────────────────────────────────────

function generateStaticPlan(
  goal: string,
  planWeeks: number,
  weeksLeft: number,
  examName: string,
  dailyHours: number,
  weakSubjects: string[],
): StudyWeek[] {
  const subjects   = GOAL_SUBJECTS[goal] ?? ["Core Subject", "Revision", "Practice", "Mock Tests"];
  const durStr     = dailyHours <= 2 ? "1h" : dailyHours <= 4 ? "1.5h" : "2h";
  const days       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

  // Phase labels based on weeks
  const phaseMap: Record<number, { title: string; theme: string }> = {
    1: { title: "Foundation Sprint",    theme: `Build strong basics across all ${examName} subjects` },
    2: { title: "Deep Dive Week",       theme: "Focus on weak areas and concept clarity" },
    3: { title: "Problem Solving Week", theme: "Practise questions — move from theory to application" },
    4: { title: "Revision Accelerator", theme: "Rapid revision of all topics covered so far" },
    5: { title: "Mock Test Week",       theme: "Full-length mock tests and analysis under exam conditions" },
    6: { title: "Final Push",           theme: "Last-minute revision, formula sheets, and confidence boost" },
  };

  // Topic pools per subject per phase
  const topicsBySubject: Record<string, string[][]> = {
    Physics:          [["Motion & Kinematics","Newton's Laws","Work & Energy"],["Waves & Sound","Electrostatics","Current Electricity"],["Optics","Magnetism","Modern Physics"],["Full Revision","Important Formulae","MCQ Practice"],["Mock Test Analysis","Weak Chapter Revision","Speed Practice"],["Formula Revision","Last 5 Years PYQs","Confidence Round"]],
    Chemistry:        [["Atomic Structure","Chemical Bonding","Mole Concept"],["Periodic Table","Thermodynamics","Equilibrium"],["Organic Reactions","Hydrocarbons","Biomolecules"],["Inorganic Revision","Organic Chains","Physical Chem Numericals"],["Full Mock Analysis","Organic Mechanisms","NCERT Reactions"],["Important Reactions","Quick Revision","Exam Strategy"]],
    Mathematics:      [["Algebra Fundamentals","Functions & Graphs","Quadratic Equations"],["Trigonometry","Coordinate Geometry","Straight Lines"],["Calculus — Limits","Derivatives","Integration Basics"],["Vectors & 3D","Probability","Statistics Revision"],["Mock Tests","Error Analysis","Speed Drills"],["Formulae Sheet","Last Year Papers","Final Review"]],
    Biology:          [["Cell Biology","Cell Division","Biomolecules"],["Plant Physiology","Photosynthesis","Respiration"],["Human Physiology","Nervous System","Endocrine System"],["Genetics & Evolution","Biotechnology","Ecology"],["Mock Test Analysis","NCERT Line-by-Line","Diagram Practice"],["Important Diagrams","Previous Year MCQs","Quick Summary"]],
    "Data Structures":[["Arrays & Strings","Linked Lists","Stacks & Queues"],["Trees & BSTs","Heaps","Graphs Basics"],["Sorting Algorithms","Searching","Hashing"],["Dynamic Programming","Greedy Algorithms","Backtracking"],["System Design Basics","Mock Interviews","LeetCode Medium"],["Company-Specific Prep","Final Review","Time Complexity Summary"]],
    Accountancy:      [["Journal Entries","Ledger Accounts","Trial Balance"],["Financial Statements","Cash Flow","Ratio Analysis"],["Partnership Accounts","Admission & Retirement","Death of Partner"],["Company Accounts","Shares & Debentures","Dissolution"],["Mock Paper Practice","Common Errors","Revision"],["Important Formats","Previous Year Papers","Formula Summary"]],
    History:          [["Ancient India","Indus Valley","Vedic Period"],["Medieval India","Mughal Empire","Bhakti Movement"],["Modern India","1857 Revolt","Indian National Congress"],["World History","World Wars","UN Formation"],["UPSC Previous Papers","Important Events Timeline","Map Work"],["Quick Revision","Important Dates","MCQ Practice"]],
    Polity:           [["Constitution Basics","Preamble","Fundamental Rights"],["Parliament","President & VP","PM & Cabinet"],["Judiciary","Supreme Court","High Courts"],["State Government","Federalism","Amendment Process"],["Important Articles","Previous Year Questions","Current Constitutional Issues"],["Quick Revision","Mock Test","Important Case Laws"]],
    Economy:          [["Indian Economy Overview","GDP & National Income","Poverty & Inequality"],["Agriculture","Industry & Services","Money & Banking"],["Fiscal Policy","Monetary Policy","Budget Basics"],["International Trade","Balance of Payments","WTO & Trade"],["Economic Survey","Current Economic Issues","Data & Statistics"],["Quick Revision","Important Committees","Mock MCQs"]],
    "Current Affairs": [["Last 3 Months Summary","Government Schemes","Important Appointments"],["International Affairs","Treaties & Summits","Awards & Prizes"],["Science & Technology News","Sports & Culture","Environment News"],["Static GK Revision","Polity Current Events","Economy News"],["Monthly Magazine Revision","Mock Test","Error Analysis"],["Last Week News","Quick Summary","Final Revision"]],
    English:          [["Grammar — Parts of Speech","Tenses","Active/Passive Voice"],["Comprehension Passages","Précis Writing","Letter Writing"],["Essay Writing","Formal Letters","Report Writing"],["Vocabulary Building","Antonyms & Synonyms","Idioms & Phrases"],["Mock Paper Practice","Speed Comprehension","Error Correction"],["Important Topics","Previous Papers","Final Polish"]],
    "General Knowledge": [["Indian Geography","World Geography","Map Work"],["Indian Polity","History","Science GK"],["Sports & Awards","Books & Authors","Important Days"],["Current Affairs","Government Schemes","Important Committees"],["Mock Test","Error Analysis","Weak Area Revision"],["Quick Summary","Previous Papers","Final Round"]],
    Algorithms:       [["Complexity Analysis","Recursion","Sorting Algorithms"],["Graph Algorithms","BFS & DFS","Shortest Path"],["Dynamic Programming Intro","Memoization","Tabulation"],["Greedy Algorithms","String Algorithms","Advanced DP"],["Mock Interviews","Competitive Programming","LeetCode Hard"],["Company Prep","System Design","Final Review"]],
    "Coding Practice": [["Easy Array Problems","String Manipulation","Basic Math Problems"],["Linked List Problems","Stack & Queue Problems","Recursion Puzzles"],["Tree Problems","Graph Problems","Sorting & Searching"],["DP Problems","Backtracking","Bit Manipulation"],["Mock Interview Practice","Time Management","Debugging Speed"],["Company-Specific Problems","Final Review","Code Quality"]],
  };

  const weeks: StudyWeek[] = [];

  for (let w = 1; w <= planWeeks; w++) {
    const phase = phaseMap[w] ?? phaseMap[6]!;
    const tasks: StudyTask[] = [];

    // Prioritise weak subjects — give them extra slots
    const subjectQueue = [...subjects];
    if (weakSubjects.length > 0) {
      // Interleave weak subjects for extra coverage
      weakSubjects.forEach((ws) => {
        const match = subjects.find((s) => s.toLowerCase().includes(ws.toLowerCase()) || ws.toLowerCase().includes(s.toLowerCase()));
        if (match) subjectQueue.splice(1, 0, match); // add weak subject as second slot
      });
    }

    days.forEach((day, dayIdx) => {
      const subject = subjectQueue[dayIdx % subjectQueue.length]!;
      const phaseIdx = Math.min(w - 1, 5);
      const topicPool = topicsBySubject[subject]?.[phaseIdx] ?? ["Core Concepts", "Practice Problems", "Revision"];
      const topic = topicPool[dayIdx % topicPool.length]!;

      const tips: Record<string, string[]> = {
        Physics:    ["Solve 10 numericals before moving on", "Draw diagrams for every problem", "Revise all formulae each morning"],
        Chemistry:  ["Write reactions by hand — don't just read", "Use colour-coded notes for organic chains", "NCERT is king — read every line"],
        Mathematics:["Practice 5 problems per concept daily", "Check all steps — don't skip intermediate work", "Memorise formulae by applying them"],
        Biology:    ["Label diagrams from memory — very NEET-important", "NCERT lines often appear verbatim in NEET", "Make flowcharts for processes"],
        default:    ["Use active recall over passive re-reading", "Teach the concept to yourself out loud", "Take a 5-minute break every 45 minutes"],
      };
      const tipPool = tips[subject] ?? tips.default!;
      const tip = tipPool[dayIdx % tipPool.length]!;

      tasks.push({ day, subject, topic, duration: durStr, tip });
    });

    weeks.push({ week: w, title: phase.title, theme: phase.theme, tasks });
  }

  return weeks;
}

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
  const planWeeks  = Math.min(weeksLeft, 6);

  const examName = EXAM_NAMES[goal] ?? "Board Exams";
  const subjects = GOAL_SUBJECTS[goal] ?? ["Core Subject", "Revision", "Practice", "Current Affairs"];
  const weakStr  = weakSubjects.length > 0 ? weakSubjects.join(", ") : "none specified";

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

  // Try AI first (all providers)
  const raw = await callAI(prompt, 5000);
  if (raw) {
    // Try to parse — strip markdown fences aggressively
    const cleaned = raw
      .replace(/^[\s\S]*?(\{|\[)/, (_, p) => p)  // strip leading prose before first { or [
      .replace(/```(?:json)?\s*/gi, "")
      .replace(/\s*```/g, "")
      .trim();

    const parsed = parseAIJson<{ weeks: StudyWeek[] }>(cleaned) ??
                   parseAIJson<{ weeks: StudyWeek[] }>(raw);

    if (parsed && Array.isArray(parsed.weeks) && parsed.weeks.length > 0) {
      res.json({ ...parsed, goal, examDate, weeksLeft, planWeeks, examName });
      return;
    }
    console.warn("[study-planner] AI returned but JSON parse failed, using static fallback");
  }

  // Static fallback — always produces a complete, useful plan
  const weeks = generateStaticPlan(goal, planWeeks, weeksLeft, examName, dailyHours, weakSubjects);
  res.json({ weeks, goal, examDate, weeksLeft, planWeeks, examName });
});

export default router;
