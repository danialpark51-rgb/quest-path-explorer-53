import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── AI Provider Helpers ───────────────────────────────────────────────────

// Groq — fastest, highest priority when key is available
async function tryGroq(prompt: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

// OpenAI / OpenRouter — second priority
async function tryOpenAI(prompt: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const isOpenRouter = key.startsWith("sk-or-");
    const baseUrl = isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
    const model   = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

// Gemini — fallback
async function tryGemini(prompt: string): Promise<string | null> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// Try all providers in priority order: Groq → OpenAI/OpenRouter → Gemini
async function callAI(prompt: string): Promise<string | null> {
  return (
    (await tryGroq(prompt)) ??
    (await tryOpenAI(prompt)) ??
    (await tryGemini(prompt))
  );
}

// ─── Route ─────────────────────────────────────────────────────────────────

// POST /api/thinking — deep AI analysis of a famous person's thinking style
router.post("/thinking", async (req, res) => {
  const { personName } = req.body as Record<string, unknown>;

  if (!personName || typeof personName !== "string" || personName.trim().length < 2) {
    res.status(400).json({ error: "Please enter a valid person's name." });
    return;
  }

  const name = personName.trim().slice(0, 100);

  const prompt = `You are an expert educational analyst and biographer specializing in the cognitive patterns and philosophies of great thinkers. A student has asked: "How did ${name} think?"

Your task: Generate a deeply researched, student-friendly analysis of ${name}'s thinking patterns, philosophy, and mindset.

IMPORTANT:
- If "${name}" is not a real, well-known historical figure, scientist, leader, artist, or philosopher, respond with exactly: NOT_FOUND
- If the name is misspelled but recognizable (e.g. "Einstien" → Einstein), analyze the correct person and note the correction at the top.

If the person IS known, generate a structured analysis with ALL of the following sections in order. Use Markdown formatting — use ## for section headings, **bold** for key terms, and bullet points where appropriate. Write at least 150 words per section. Be detailed, accurate, and easy for school students (age 12–18) to understand.

## 🧠 Profile Summary
Who ${name} was — brief background: birth, field, era, major contributions. Why students should know about them.

## 💡 Core Thinking Pattern
How ${name} approached problems and learning. Their mental frameworks, habits of mind, and signature cognitive style. Specific examples of how they thought through challenges.

## 🔬 Problem-Solving Style
Step-by-step: how ${name} tackled difficult problems. Did they use experiments, thought experiments, first principles, creative leaps, persistence, collaboration? Give 2–3 real examples from their life.

## 🌍 Philosophy & Worldview
What ${name} believed about the world, knowledge, humanity, and progress. Their core values, guiding principles, and how their philosophy shaped their work.

## ⚡ Emotional Intelligence & Leadership
How ${name} handled failure, criticism, and setbacks. Their relationship style, how they led or influenced others, and their emotional resilience.

## 🚀 Innovation & Creativity Style
How ${name} generated new ideas. Were they incremental thinkers or disruptors? How did they connect ideas across domains? Examples of their most creative breakthroughs.

## 📚 What Students Can Learn
5–7 specific, actionable lessons that students today can take from ${name}'s way of thinking and working. Make each lesson practical and relatable to school life.

## 🌟 Famous Quotes & Their Meaning
3–5 real quotes from ${name} with a 2–3 sentence explanation of what each quote means and how a student can apply it.

Write with warmth, depth, and precision. This is for students who want to model their thinking after the world's greatest minds.`;

  const raw = await callAI(prompt);

  if (!raw) {
    res.status(503).json({
      error: "AI service unavailable. Please check that GROQ_API_KEY or OPENAI_API_KEY is set.",
    });
    return;
  }

  if (raw.trim().startsWith("NOT_FOUND")) {
    res.status(404).json({
      error: `We couldn't find reliable information about "${name}". Please check the spelling or try a well-known historical figure, scientist, leader, or philosopher.`,
    });
    return;
  }

  res.json({ personName: name, analysis: raw.trim() });
});

export default router;
