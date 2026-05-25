import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are EduPath AI — a friendly, encouraging educational assistant for school students in India (Classes 6–10). 
You specialize in:
- Subject help: Maths, Science, Social Studies, English, Hindi
- Exam prep: JEE, NEET, CBSE, state boards, Olympiads
- Career guidance: Engineering, Medical, Commerce, Arts, IT, Defence, Government jobs
- Study strategies, time management, motivation
- Current affairs and general knowledge

Always respond in a warm, student-friendly tone. Keep answers concise and educational. Use examples relevant to India when possible.`;

router.post("/chat", async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Invalid request body: messages array required" });
    return;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GOOGLE_AI_API_KEY;

  if (openaiKey) {
    await handleOpenAI(messages, openaiKey, res);
  } else if (geminiKey) {
    await handleGemini(messages, geminiKey, res);
  } else {
    res.status(503).json({ error: "AI service is not configured." });
  }
});

async function handleOpenAI(
  messages: { role: string; content: string }[],
  apiKey: string,
  res: import("express").Response,
): Promise<void> {
  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      res.status(upstream.status).json({ error: (err as { error?: { message?: string } }).error?.message ?? "OpenAI request failed" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    if (!upstream.body) {
      res.status(500).json({ error: "No response body from OpenAI" });
      return;
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    const pump = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) {
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }
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

async function handleGemini(
  messages: { role: string; content: string }[],
  apiKey: string,
  res: import("express").Response,
): Promise<void> {
  try {
    const geminiMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      },
    );

    if (!upstream.ok || !upstream.body) {
      res.status(upstream.status).json({ error: "Gemini request failed" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const pump = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) {
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const text: string | undefined =
            parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const chunk = {
              choices: [{ delta: { content: text }, index: 0, finish_reason: null }],
            };
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          }
        } catch {
          // skip malformed chunks
        }
      }
      return pump();
    };

    await pump();
  } catch (_err) {
    if (!res.headersSent) {
      res.status(502).json({ error: "Failed to reach Gemini service" });
    }
  }
}

export default router;
