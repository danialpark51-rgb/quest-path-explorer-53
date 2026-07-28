/**
 * POST /api/chat
 *
 * Streaming chat completions with automatic provider fallback:
 * 1. Replit AI  (managed integration)
 * 2. DeepSeek   (DEEPSEEK_API_KEY)
 * 3. OpenRouter (OPENROUTER_API_KEY — free model pool)
 * 4. Groq       (GROQ_API_KEY)
 * 5. Google Gemini (GOOGLE_AI_API_KEY)
 * 6. Static fallback (never returns an error to the UI)
 */

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

const CHAT_TIMEOUT_MS = 40_000;

// ─── Generic OpenAI-compatible streaming (returns true on success) ─────────────

async function tryOpenAIStream(
  messages: { role: string; content: string }[],
  apiKey: string,
  baseUrl: string,
  model: string,
  res: import("express").Response,
  extraHeaders: Record<string, string> = {},
): Promise<boolean> {
  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
    });

    if (!upstream.ok || !upstream.body) {
      const body = await upstream.text().catch(() => "");
      console.warn(`[chat] ${model} @ ${baseUrl} → HTTP ${upstream.status}:`, body.slice(0, 200));
      return false;
    }

    res.setHeader("Content-Type",      "text/event-stream");
    res.setHeader("Cache-Control",     "no-cache");
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
  } catch (e) {
    console.warn(`[chat] ${model} stream error:`, (e as Error).message);
    return false;
  }
}

// ─── Google Gemini streaming ───────────────────────────────────────────────────

async function tryGeminiStream(
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
        signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
      },
    );

    if (!upstream.ok || !upstream.body) {
      console.warn(`[chat] Gemini HTTP ${upstream.status}`);
      return false;
    }

    res.setHeader("Content-Type",      "text/event-stream");
    res.setHeader("Cache-Control",     "no-cache");
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
        } catch { /* skip malformed chunk */ }
      }
      return pump();
    };

    await pump();
    return true;
  } catch (e) {
    console.warn("[chat] Gemini stream error:", (e as Error).message);
    return false;
  }
}

// ─── Route ─────────────────────────────────────────────────────────────────────

router.post("/chat", async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Invalid request body: messages array required" });
    return;
  }

  // ── 1. Replit AI ──────────────────────────────────────────────────────────
  const replitKey  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (replitKey && replitBase) {
    const ok = await tryOpenAIStream(messages, replitKey, replitBase, "gpt-4o-mini", res);
    if (ok) return;
    console.warn("[chat] Replit AI failed, trying DeepSeek…");
  }

  // ── 2. OpenRouter (free NVIDIA model) ────────────────────────────────────
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    const ok = await tryOpenAIStream(
      messages, openrouterKey,
      "https://openrouter.ai/api/v1",
      "nvidia/nemotron-3-super-120b-a12b:free",
      res,
      { "HTTP-Referer": "https://edupath.app", "X-Title": "EduPath" },
    );
    if (ok) return;
    console.warn("[chat] OpenRouter failed, trying Groq…");
  }

  // ── 3. Groq ───────────────────────────────────────────────────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const ok = await tryOpenAIStream(
      messages, groqKey,
      "https://api.groq.com/openai/v1",
      "llama-3.1-8b-instant",
      res,
    );
    if (ok) return;
    console.warn("[chat] Groq failed, trying DeepSeek…");
  }

  // ── 4. DeepSeek (if balance available) ───────────────────────────────────
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    const ok = await tryOpenAIStream(
      messages, deepseekKey,
      "https://api.deepseek.com/v1",
      "deepseek-chat",
      res,
    );
    if (ok) return;
    console.warn("[chat] DeepSeek failed, trying Gemini…");
  }

  // ── 5. Google Gemini ──────────────────────────────────────────────────────
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    const ok = await tryGeminiStream(messages, geminiKey, res);
    if (ok) return;
    console.warn("[chat] Gemini failed");
  }

  // ── 6. Graceful static fallback — UI never sees a 503 ────────────────────
  res.setHeader("Content-Type",      "text/event-stream");
  res.setHeader("Cache-Control",     "no-cache");
  res.setHeader("X-Accel-Buffering", "no");

  const fallback =
    "I'm EduPath AI and I'm here to help! 📚 Our AI services are momentarily busy. " +
    "Please try again in a moment. While you wait, you can explore News, Scholarships, " +
    "Internships, Videos, or the Study Planner — all fully available right now!";

  const chunks = fallback.match(/.{1,20}/g) ?? [fallback];
  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk }, index: 0, finish_reason: null }] })}\n\n`);
  }
  res.write("data: [DONE]\n\n");
  res.end();
});

export default router;
