import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are EduPath AI — a friendly, encouraging educational assistant for school students in India (Classes 5–12). 
You specialize in:
- Subject help: Maths, Science, Social Studies, English, Hindi, Kannada, Telugu, Tamil, Marathi
- Exam prep: JEE, NEET, CBSE, state boards, Olympiads, CET, GATE, CAT
- Career guidance: Engineering, Medical, Commerce, Arts, IT, Defence, Government jobs
- Scholarships and internships for Indian school students
- Study strategies, time management, motivation
- Current affairs and general knowledge

Always respond in a warm, student-friendly tone. Keep answers concise and educational. Use examples relevant to India when possible. If the student asks in Hindi, Kannada, or another Indian language, respond in that language.`;

// ─── Provider configs ─────────────────────────────────────────────────────────

function getProviders() {
  const replitKey  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const groqKey    = process.env.GROQ_API_KEY;
  const openaiKey  = process.env.OPENAI_API_KEY;
  const geminiKey  = process.env.GOOGLE_AI_API_KEY;

  return { replitKey, replitBase, groqKey, openaiKey, geminiKey };
}

router.post("/chat", async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Invalid request body: messages array required" });
    return;
  }

  const { replitKey, replitBase, groqKey, openaiKey, geminiKey } = getProviders();

  // 1. Replit AI (managed integration — fastest in dev)
  if (replitKey && replitBase) {
    await handleOpenAICompat(messages, replitKey, replitBase, "gpt-4o-mini", res);
    return;
  }

  // 2. Groq — free tier, very fast, llama3 model
  if (groqKey) {
    const ok = await tryOpenAICompat(
      messages, groqKey,
      "https://api.groq.com/openai/v1",
      "llama-3.1-8b-instant",
      res,
    );
    if (ok) return;
    console.warn("[chat] Groq failed, falling back…");
  }

  // 3. OpenAI / OpenRouter
  if (openaiKey) {
    const isOpenRouter = openaiKey.startsWith("sk-or-");
    const baseUrl = isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
    const model   = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
    const ok = await tryOpenAICompat(messages, openaiKey, baseUrl, model, res);
    if (ok) return;
    console.warn("[chat] OpenAI/OpenRouter failed, falling back…");
  }

  // 4. Google Gemini
  if (geminiKey) {
    const ok = await tryGemini(messages, geminiKey, res);
    if (ok) return;
    console.warn("[chat] Gemini failed");
  }

  // Graceful fallback — stream a helpful message so the UI doesn't break
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");

  const fallbackMessage =
    "I'm sorry, the AI assistant is temporarily unavailable (API quota exceeded). " +
    "Please try again later, or check your Gemini API billing at https://ai.dev/rate-limit. " +
    "You can still use all other EduPath features — news, scholarships, internships, videos, and study planner are fully functional!";

  const chunks = fallbackMessage.match(/.{1,15}/g) ?? [fallbackMessage];
  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk }, index: 0, finish_reason: null }] })}\n\n`);
  }
  res.write("data: [DONE]\n\n");
  res.end();
});

// ─── OpenAI-compatible provider (non-throwing, returns success boolean) ───────

async function tryOpenAICompat(
  messages: { role: string; content: string }[],
  apiKey: string,
  baseUrl: string,
  model: string,
  res: import("express").Response,
): Promise<boolean> {
  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream:     true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!upstream.ok || !upstream.body) {
      console.warn(`[chat] ${baseUrl} → HTTP ${upstream.status}`);
      return false;
    }

    res.setHeader("Content-Type",    "text/event-stream");
    res.setHeader("Cache-Control",   "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();

    const pump = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) { res.write("data: [DONE]\n\n"); res.end(); return; }
      res.write(decoder.decode(value, { stream: true }));
      return pump();
    };
    await pump();
    return true;
  } catch {
    return false;
  }
}

// ─── OpenAI-compatible provider (throwing version for managed Replit key) ────

async function handleOpenAICompat(
  messages: { role: string; content: string }[],
  apiKey: string,
  baseUrl: string,
  model: string,
  res: import("express").Response,
): Promise<void> {
  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream:     true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      res.status(upstream.status).json({
        error: (err as { error?: { message?: string } }).error?.message ?? "AI request failed",
      });
      return;
    }

    res.setHeader("Content-Type",    "text/event-stream");
    res.setHeader("Cache-Control",   "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    if (!upstream.body) {
      res.status(500).json({ error: "No response body from AI service" });
      return;
    }

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();

    const pump = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) { res.write("data: [DONE]\n\n"); res.end(); return; }
      res.write(decoder.decode(value, { stream: true }));
      return pump();
    };
    await pump();
  } catch (_err) {
    if (!res.headersSent) {
      res.status(502).json({ error: "Failed to reach AI service" });
    }
  }
}

// ─── Google Gemini ─────────────────────────────────────────────────────────────

async function tryGemini(
  messages: { role: string; content: string }[],
  apiKey: string,
  res: import("express").Response,
): Promise<boolean> {
  try {
    const geminiMessages = messages.map((m) => ({
      role:  m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents:           geminiMessages,
          generationConfig:   { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      },
    );

    if (!upstream.ok || !upstream.body) return false;

    res.setHeader("Content-Type",    "text/event-stream");
    res.setHeader("Cache-Control",   "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const pump = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) { res.write("data: [DONE]\n\n"); res.end(); return; }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const text: string | undefined = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: text }, index: 0, finish_reason: null }] })}\n\n`);
          }
        } catch { /* skip */ }
      }
      return pump();
    };

    await pump();
    return true;
  } catch {
    return false;
  }
}

export default router;
