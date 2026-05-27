import { Router, type IRouter } from "express";

const router: IRouter = Router();

type Problem = {
  title: string;
  emoji: string;
  domain: string;
  description: string;
  cause: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  location: string;
};

async function callAI(prompt: string): Promise<string | null> {
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.8 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch { /* fall through */ }
  }

  if (openaiKey) {
    try {
      const isOpenRouter = openaiKey.startsWith("sk-or-");
      const baseUrl = isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
      const model = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2048,
          temperature: 0.8,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { choices?: { message?: { content?: string } }[] };
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch { /* fall through */ }
  }

  return null;
}

router.post("/problem-finder", async (req, res) => {
  const { goal, region, classStandard } = req.body as Record<string, unknown>;

  const safeGoal = String(goal ?? "Science").slice(0, 50);
  const safeRegion = String(region ?? "India").slice(0, 80);
  const safeClass = String(classStandard ?? "9").slice(0, 10);

  const prompt = `You are an expert project mentor for Indian school students (Class ${safeClass}).
Generate exactly 6 real-world problems relevant to the field of "${safeGoal}" that a student in ${safeRegion}, India can solve as a school project.

Return ONLY a valid JSON array — no markdown, no explanation, no extra text. Use this exact structure:
[
  {
    "title": "short problem title (max 10 words)",
    "emoji": "one relevant emoji",
    "domain": "specific sub-field (e.g. Robotics, Nutrition, Finance)",
    "description": "2-3 sentences explaining the problem clearly",
    "cause": "the main root cause of this problem",
    "impact": "why solving this matters for the community",
    "difficulty": "Easy",
    "location": "specific region/city/state in India where this is common"
  }
]
Make difficulty one of: Easy, Medium, Hard. Make problems realistic, local, and solvable by school students.`;

  const raw = await callAI(prompt);

  if (!raw) {
    res.status(503).json({ error: "AI service unavailable" });
    return;
  }

  // Extract JSON array from response
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    res.status(502).json({ error: "Could not parse AI response" });
    return;
  }

  try {
    const problems = JSON.parse(match[0]) as Problem[];
    res.json({ problems, goal: safeGoal, region: safeRegion });
  } catch {
    res.status(502).json({ error: "Malformed AI response" });
  }
});

export default router;
