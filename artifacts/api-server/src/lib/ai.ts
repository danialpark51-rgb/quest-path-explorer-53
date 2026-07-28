/**
 * Shared AI provider helper — tries providers in priority order:
 * 1. Replit AI  (managed integration)
 * 2. DeepSeek   (DEEPSEEK_API_KEY  — fast, high quality)
 * 3. OpenRouter (OPENROUTER_API_KEY — free model pool)
 * 4. Groq       (GROQ_API_KEY      — free, very fast)
 * 5. OpenAI     (OPENAI_API_KEY    — direct or OpenRouter key reused)
 * 6. Google Gemini (GOOGLE_AI_API_KEY)
 */

const AI_TIMEOUT_MS = 45_000;

// ─── Replit AI ────────────────────────────────────────────────────────────────

async function tryReplitAI(prompt: string, maxTokens = 4096): Promise<string | null> {
  const key  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const base = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!key || !base) return null;
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (!res.ok) { console.warn(`[ai] ReplitAI HTTP ${res.status}`); return null; }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn("[ai] ReplitAI error:", (e as Error).message);
    return null;
  }
}

// ─── DeepSeek ─────────────────────────────────────────────────────────────────

async function tryDeepSeek(prompt: string, maxTokens = 4096): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[ai] DeepSeek HTTP ${res.status}:`, body.slice(0, 200));
      return null;
    }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn("[ai] DeepSeek error:", (e as Error).message);
    return null;
  }
}

// ─── OpenRouter ───────────────────────────────────────────────────────────────

async function tryOpenRouter(prompt: string, maxTokens = 4096): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://edupath.app",
        "X-Title": "EduPath",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[ai] OpenRouter HTTP ${res.status}:`, body.slice(0, 200));
      return null;
    }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn("[ai] OpenRouter error:", (e as Error).message);
    return null;
  }
}

// ─── Groq ─────────────────────────────────────────────────────────────────────

async function tryGroq(prompt: string, maxTokens = 4096): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[ai] Groq HTTP ${res.status}:`, body.slice(0, 200));
      return null;
    }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn("[ai] Groq error:", (e as Error).message);
    return null;
  }
}

// ─── OpenAI (direct or OPENAI_API_KEY pointing at OpenRouter) ────────────────

async function tryOpenAI(prompt: string, maxTokens = 4096): Promise<string | null> {
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
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[ai] OpenAI HTTP ${res.status}:`, body.slice(0, 200));
      return null;
    }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn("[ai] OpenAI error:", (e as Error).message);
    return null;
  }
}

// ─── Google Gemini ────────────────────────────────────────────────────────────

async function tryGemini(prompt: string, maxTokens = 4096): Promise<string | null> {
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
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) {
        console.warn("[ai] Gemini quota exceeded (429)");
      } else {
        console.warn(`[ai] Gemini HTTP ${res.status}:`, body.slice(0, 200));
      }
      return null;
    }
    const data = await res.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (e) {
    console.warn("[ai] Gemini error:", (e as Error).message);
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call AI with automatic provider fallback.
 * Priority: ReplitAI → OpenRouter (free) → Groq → DeepSeek → OpenAI → Gemini
 * Returns null only if every provider fails.
 */
export async function callAI(prompt: string, maxTokens = 4096): Promise<string | null> {
  const result =
    (await tryReplitAI(prompt, maxTokens))   ??
    (await tryOpenRouter(prompt, maxTokens)) ??
    (await tryGroq(prompt, maxTokens))       ??
    (await tryDeepSeek(prompt, maxTokens))   ??
    (await tryOpenAI(prompt, maxTokens))     ??
    (await tryGemini(prompt, maxTokens));

  if (!result) {
    console.error("[ai] All providers failed for prompt:", prompt.slice(0, 80));
  }
  return result;
}

/** Parse JSON from AI output, stripping markdown fences if present. */
export function parseAIJson<T>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/\s*```\s*$/im, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    // Try extracting first {...} block
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]) as T; } catch { /* fall through */ }
    }
    return null;
  }
}
