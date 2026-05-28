/**
 * Skill Reels AI Studio — API Routes
 *
 * Endpoints:
 *   GET  /api/reels                        – Paginated public feed
 *   GET  /api/reels/trending               – Trending hashtags (AI-powered)
 *   GET  /api/reels/leaderboard            – Top reels by likes
 *   GET  /api/reels/user/:username         – A user's own reels
 *   GET  /api/reels/:reelId                – Single reel detail
 *   GET  /api/reels/:reelId/comments       – Comments on a reel
 *   POST /api/reels                        – Publish a new reel
 *   POST /api/reels/generate               – AI scene + hashtag generation (OpenAI)
 *   POST /api/reels/pika-generate          – Start a Pika AI video generation job
 *   GET  /api/reels/pika-status/:jobId     – Poll Pika job for completion
 *   POST /api/reels/:reelId/like           – Toggle like (prevents double-like)
 *   POST /api/reels/:reelId/comment        – Add a comment
 *   POST /api/reels/:reelId/view           – Increment view counter
 *   DELETE /api/reels/:reelId              – Delete own reel
 */

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reelsTable, reelLikesTable, reelCommentsTable } from "@workspace/db";
import { eq, desc, asc, sql, and } from "drizzle-orm";

const router: IRouter = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateReelId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─── OpenAI / Replit AI helper ────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string | null> {
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
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

// ─── Pika API Integration ─────────────────────────────────────────────────────
//
// Integration supports two Pika access paths, tried in order:
//   1. Pika direct API (api.pika.art) — for partner / beta API keys
//   2. pikapikapika.io community wrapper — alternative access path
//
// To add more providers (Runway ML, Kling AI, Sora, Luma Dream Machine):
//   Implement another attempt block below following the same pattern.
//
// API key is stored as PIKA_API_KEY environment secret.

type PikaStartResult =
  | { jobId: string; provider: "pika-direct" | "pikapikapika" }
  | { error: string };

type PikaStatusResult = {
  status: "pending" | "processing" | "finished" | "failed";
  videoUrl?: string;
};

/**
 * Build an AI-optimised prompt for Pika video generation.
 * The prompt is designed to produce cinematic, youth-friendly educational reels.
 */
function buildPikaPrompt(
  title: string,
  scenes: Array<{ text?: string; subtext?: string }>,
  templateName: string,
  gradientColors: string[],
): string {
  const sceneSummary = scenes
    .slice(0, 3)
    .map(s => [s.text, s.subtext].filter(Boolean).join(": "))
    .join(". ");

  return [
    `Educational reel for Indian students. Theme: "${title}".`,
    `Style: ${templateName} — cinematic, colorful, energetic, fast-paced.`,
    sceneSummary ? `Key moments: ${sceneSummary}.` : "",
    `Colors: vibrant gradients ${gradientColors.join(" to ")}.`,
    "Visual: bold typography reveals, particle effects, light leaks, smooth transitions.",
    "Mood: motivational, aspirational, social-media-ready.",
    "Format: vertical 9:16, 3 seconds, studio-quality.",
  ].filter(Boolean).join(" ").slice(0, 600);
}

/** Start a Pika video generation job. Returns a jobId on success. */
async function startPikaGeneration(prompt: string): Promise<PikaStartResult> {
  const apiKey = process.env.PIKA_API_KEY;
  if (!apiKey) {
    return {
      error: "Pika API key not configured. Add PIKA_API_KEY to your environment secrets.",
    };
  }

  // ── Attempt 1: Pika direct API (api.pika.art) ─────────────────────────────
  // Used by partner / beta programme API keys (UUID:hash format).
  try {
    const r = await fetch("https://api.pika.art/v1/generate/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        promptText: prompt,
        options: {
          aspectRatio: "9:16",
          frameRate: 24,
          duration: 3,
          parameters: { motion: 2, guidanceScale: 12 },
        },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (r.ok) {
      const d = await r.json() as Record<string, unknown>;
      const jobId = String(d.id ?? d.videoId ?? d.job_id ?? "");
      if (jobId) {
        console.log("[pika] started via pika-direct, jobId:", jobId);
        return { jobId, provider: "pika-direct" };
      }
    } else {
      console.warn("[pika] pika-direct returned", r.status, await r.text().catch(() => ""));
    }
  } catch (e) {
    console.warn("[pika] pika-direct attempt failed:", (e as Error).message);
  }

  // ── Attempt 2: pikapikapika.io community wrapper ──────────────────────────
  // Alternative access path; uses the same API key as Bearer token.
  try {
    const r = await fetch("https://api.pikapikapika.io/web/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompts: prompt,
        options: {
          frameRate: 24,
          aspectRatio: "9:16",
          cameraControl: { type: "zoom_in" },
          parameters: { motion: 1, guidanceScale: 12 },
        },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (r.ok) {
      const d = await r.json() as { videos?: Array<{ id: string }> };
      const jobId = d.videos?.[0]?.id ?? "";
      if (jobId) {
        console.log("[pika] started via pikapikapika, jobId:", jobId);
        return { jobId, provider: "pikapikapika" };
      }
    } else {
      console.warn("[pika] pikapikapika returned", r.status, await r.text().catch(() => ""));
    }
  } catch (e) {
    console.warn("[pika] pikapikapika attempt failed:", (e as Error).message);
  }

  return {
    error:
      "Could not reach Pika API. Check that PIKA_API_KEY is correct and the service is reachable.",
  };
}

/** Poll a Pika job for its status and final video URL. */
async function getPikaStatus(jobId: string, provider: string): Promise<PikaStatusResult> {
  const apiKey = process.env.PIKA_API_KEY;
  if (!apiKey) return { status: "failed" };

  if (provider === "pikapikapika") {
    try {
      const r = await fetch(`https://api.pikapikapika.io/web/videos/${jobId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(12_000),
      });
      if (r.ok) {
        const d = await r.json() as { video?: { status?: string; resultUrl?: string } };
        const v = d.video ?? {};
        const status: PikaStatusResult["status"] =
          v.status === "finished" ? "finished" :
          v.status === "failed"   ? "failed"   : "processing";
        return { status, videoUrl: v.resultUrl };
      }
    } catch { /* fall through */ }
  } else {
    // pika-direct
    try {
      const r = await fetch(`https://api.pika.art/v1/videos/${jobId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(12_000),
      });
      if (r.ok) {
        const d = await r.json() as {
          status?: string;
          resultUrl?: string;
          video_url?: string;
          url?: string;
        };
        const status: PikaStatusResult["status"] =
          d.status === "finished" ? "finished" :
          d.status === "failed"   ? "failed"   : "processing";
        return { status, videoUrl: d.resultUrl ?? d.video_url ?? d.url };
      }
    } catch { /* fall through */ }
  }

  return { status: "processing" };
}

// ─── GET /api/reels ───────────────────────────────────────────────────────────

router.get("/reels", async (req, res) => {
  const limit  = Math.min(Number(req.query.limit  ?? 30), 100);
  const offset = Number(req.query.offset ?? 0);
  try {
    const rows = await db
      .select({
        id: reelsTable.id, reelId: reelsTable.reelId,
        username: reelsTable.username, fullName: reelsTable.fullName,
        title: reelsTable.title, templateId: reelsTable.templateId,
        thumbnailData: reelsTable.thumbnailData,
        hashtags: reelsTable.hashtags, musicTrack: reelsTable.musicTrack,
        goal: reelsTable.goal, contentType: reelsTable.contentType,
        likes: reelsTable.likes, views: reelsTable.views,
        videoUrl: reelsTable.videoUrl,
        remixedFrom: reelsTable.remixedFrom, remixedFromUser: reelsTable.remixedFromUser,
        createdAt: reelsTable.createdAt,
      })
      .from(reelsTable)
      .where(eq(reelsTable.isPublic, true))
      .orderBy(desc(reelsTable.createdAt))
      .limit(limit)
      .offset(offset);
    res.json({ reels: rows });
  } catch (err) {
    console.error("[reels] GET /reels error:", err);
    res.status(500).json({ error: "Failed to load reels." });
  }
});

// ─── GET /api/reels/trending ──────────────────────────────────────────────────

router.get("/reels/trending", (req, res) => {
  const goal = String(req.query.goal ?? "");
  const baseTags = ["#EduPath", "#StudentLife", "#Learning2025", "#IndiaStudents", "#Viral"];
  const goalTags: Record<string, string[]> = {
    Engineering: ["#JEE2025", "#IITDream", "#STEM", "#CodeLife", "#EnggStudent"],
    Medical:     ["#NEET2025", "#MedStudent", "#Doctor", "#MBBS", "#Biology"],
    Commerce:    ["#CA2025", "#Finance", "#Entrepreneur", "#Business", "#Commerce"],
    Arts:        ["#ArtLife", "#Creative", "#Design", "#Talent", "#NID"],
    IT:          ["#CodeLife", "#Programming", "#WebDev", "#TechTok", "#Python"],
    Defence:     ["#NDA2025", "#ArmyLife", "#Patriot", "#Defence", "#Soldier"],
    Govt:        ["#UPSC2025", "#IAS", "#SSC", "#GovtJob", "#CivilServices"],
  };
  const trending = [
    ...baseTags,
    ...(goalTags[goal] ?? ["#StudyMotivation", "#SchoolLife", "#Goals"]),
  ];
  res.json({ hashtags: [...new Set(trending)].slice(0, 15) });
});

// ─── GET /api/reels/leaderboard ───────────────────────────────────────────────

router.get("/reels/leaderboard", async (_req, res) => {
  try {
    const rows = await db
      .select({
        reelId: reelsTable.reelId, username: reelsTable.username,
        fullName: reelsTable.fullName, title: reelsTable.title,
        templateId: reelsTable.templateId, thumbnailData: reelsTable.thumbnailData,
        likes: reelsTable.likes, views: reelsTable.views,
        hashtags: reelsTable.hashtags, videoUrl: reelsTable.videoUrl,
        remixedFrom: reelsTable.remixedFrom, remixedFromUser: reelsTable.remixedFromUser,
        createdAt: reelsTable.createdAt,
      })
      .from(reelsTable)
      .where(eq(reelsTable.isPublic, true))
      .orderBy(desc(reelsTable.likes))
      .limit(10);
    res.json({ leaderboard: rows });
  } catch (err) {
    console.error("[reels] leaderboard error:", err);
    res.status(500).json({ error: "Failed to load leaderboard." });
  }
});

// ─── GET /api/reels/user/:username ────────────────────────────────────────────

router.get("/reels/user/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const rows = await db
      .select()
      .from(reelsTable)
      .where(eq(reelsTable.username, username))
      .orderBy(desc(reelsTable.createdAt))
      .limit(50);
    res.json({ reels: rows });
  } catch (err) {
    console.error("[reels] user reels error:", err);
    res.status(500).json({ error: "Failed to load user reels." });
  }
});

// ─── GET /api/reels/:reelId ───────────────────────────────────────────────────

router.get("/reels/:reelId", async (req, res) => {
  const { reelId } = req.params;
  try {
    const [reel] = await db
      .select()
      .from(reelsTable)
      .where(eq(reelsTable.reelId, reelId))
      .limit(1);
    if (!reel) { res.status(404).json({ error: "Reel not found" }); return; }
    res.json(reel);
  } catch (err) {
    console.error("[reels] get reel error:", err);
    res.status(500).json({ error: "Failed to load reel." });
  }
});

// ─── GET /api/reels/:reelId/comments ─────────────────────────────────────────

router.get("/reels/:reelId/comments", async (req, res) => {
  const { reelId } = req.params;
  try {
    const rows = await db
      .select()
      .from(reelCommentsTable)
      .where(eq(reelCommentsTable.reelId, reelId))
      .orderBy(asc(reelCommentsTable.createdAt));
    res.json({ comments: rows });
  } catch {
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});

// ─── POST /api/reels ──────────────────────────────────────────────────────────

router.post("/reels", async (req, res) => {
  const {
    username, fullName, title, templateId, scenesJson,
    thumbnailData, hashtags, musicTrack, goal, contentType,
    videoUrl, remixedFrom, remixedFromUser,
  } = req.body as Record<string, unknown>;

  if (!username || !title || !templateId || !scenesJson) {
    res.status(400).json({ error: "username, title, templateId, scenesJson are required." });
    return;
  }
  try { JSON.parse(String(scenesJson)); } catch {
    res.status(400).json({ error: "scenesJson must be valid JSON." });
    return;
  }

  try {
    const reelId = generateReelId();
    const [created] = await db.insert(reelsTable).values({
      reelId,
      username:        String(username).slice(0, 50),
      fullName:        String(fullName ?? username).slice(0, 100),
      title:           String(title).trim().slice(0, 120),
      templateId:      String(templateId),
      scenesJson:      String(scenesJson),
      thumbnailData:   thumbnailData ? String(thumbnailData).slice(0, 200_000) : null,
      hashtags:        String(hashtags ?? "").slice(0, 500),
      musicTrack:      String(musicTrack ?? "").slice(0, 50),
      goal:            String(goal ?? "").slice(0, 50),
      contentType:     String(contentType ?? "").slice(0, 30),
      videoUrl:        videoUrl        ? String(videoUrl).slice(0, 2000)        : null,
      remixedFrom:     remixedFrom     ? String(remixedFrom).slice(0, 20)       : null,
      remixedFromUser: remixedFromUser ? String(remixedFromUser).slice(0, 50)   : null,
    }).returning();
    res.status(201).json(created);
  } catch (err) {
    console.error("[reels] POST /reels error:", err);
    res.status(500).json({ error: "Failed to publish reel." });
  }
});

// ─── POST /api/reels/generate ─────────────────────────────────────────────────
// Uses Replit AI (OpenAI-compatible) to write scene text + hashtags.

router.post("/reels/generate", async (req, res) => {
  const { title, subtitle, contentType, score, goal } = req.body as Record<string, unknown>;

  const safeTitle       = String(title ?? "My Achievement").slice(0, 100);
  const safeSubtitle    = String(subtitle ?? "").slice(0, 100);
  const safeContentType = String(contentType ?? "achievement");
  const safeScore       = String(score ?? "");
  const safeGoal        = String(goal ?? "");

  const prompt = `You are a creative social-media reel writer for Indian school students.
Generate 3 short, punchy, engaging scenes for a ${safeContentType} reel about:
- Title: "${safeTitle}"
- Subtitle: "${safeSubtitle}"
${safeScore ? `- Score/Achievement: ${safeScore}` : ""}
${safeGoal ? `- Student's goal: ${safeGoal}` : ""}

Each scene should be 3–6 words for the main text, and an optional subtitle of 4–8 words.
Make it exciting, youth-friendly, and shareable.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "scenes": [
    {"id":"s1","text":"Scene main text","subtext":"Optional subtitle","caption":"Optional caption","duration":3200},
    {"id":"s2","text":"Scene main text","subtext":"Optional subtitle","caption":"Optional caption","duration":2800},
    {"id":"s3","text":"Scene main text","subtext":"Optional subtitle","caption":"Optional caption","duration":2500}
  ],
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8"]
}
Duration is in milliseconds (2500–4000). Hashtags should be relevant and trending-style.`;

  const raw = await callAI(prompt);

  if (!raw) {
    res.json({
      scenes: [
        { id: "s1", text: safeTitle, subtext: safeSubtitle || `${safeContentType} Unlocked!`, duration: 3200 },
        { id: "s2", text: safeScore || "Level Up!", subtext: "Hard work pays off 🔥", caption: "Keep going!", duration: 2800 },
        { id: "s3", text: "Dream. Study. Win.", subtext: "🚀 EduPath Student", caption: "#EduPath", duration: 2500 },
      ],
      hashtags: ["#EduPath", "#StudentLife", "#Winning", "#StudyMotivation", "#India"],
    });
    return;
  }

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    res.status(502).json({ error: "Could not parse AI response." });
    return;
  }

  try {
    const parsed = JSON.parse(match[0]) as { scenes: unknown[]; hashtags: string[] };
    res.json(parsed);
  } catch {
    res.status(502).json({ error: "Malformed AI response." });
  }
});

// ─── POST /api/reels/pika-generate ───────────────────────────────────────────
// Starts an async Pika video generation job.
// Returns { jobId, provider } on success for the client to poll.

router.post("/reels/pika-generate", async (req, res) => {
  const {
    title, scenes, templateName, gradientColors,
  } = req.body as {
    title?: string;
    scenes?: Array<{ text?: string; subtext?: string }>;
    templateName?: string;
    gradientColors?: string[];
  };

  const prompt = buildPikaPrompt(
    String(title ?? "Student Achievement"),
    scenes ?? [],
    String(templateName ?? "Study Motivation"),
    gradientColors ?? ["#6C3483", "#1A5276"],
  );

  console.log("[pika] generating with prompt:", prompt.slice(0, 120), "…");

  const result = await startPikaGeneration(prompt);

  if ("error" in result) {
    res.status(503).json({ error: result.error });
    return;
  }

  res.json({ jobId: result.jobId, provider: result.provider });
});

// ─── GET /api/reels/pika-status/:jobId ───────────────────────────────────────
// Polls the Pika job until it finishes. The client calls this every ~4 seconds.
// Returns { status: "pending"|"processing"|"finished"|"failed", videoUrl? }

router.get("/reels/pika-status/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const provider  = String(req.query.provider ?? "pika-direct");
  const result    = await getPikaStatus(jobId, provider);
  res.json(result);
});

// ─── POST /api/reels/:reelId/like ────────────────────────────────────────────

router.post("/reels/:reelId/like", async (req, res) => {
  const { reelId }  = req.params;
  const { username } = req.body as Record<string, unknown>;
  if (!username) { res.status(400).json({ error: "username required" }); return; }

  try {
    const [existing] = await db
      .select()
      .from(reelLikesTable)
      .where(and(eq(reelLikesTable.reelId, reelId), eq(reelLikesTable.username, String(username))))
      .limit(1);

    if (existing) {
      await db.delete(reelLikesTable).where(eq(reelLikesTable.id, existing.id));
      await db.update(reelsTable)
        .set({ likes: sql`GREATEST(${reelsTable.likes} - 1, 0)` })
        .where(eq(reelsTable.reelId, reelId));
      res.json({ liked: false });
    } else {
      await db.insert(reelLikesTable).values({ reelId, username: String(username) });
      await db.update(reelsTable)
        .set({ likes: sql`${reelsTable.likes} + 1` })
        .where(eq(reelsTable.reelId, reelId));
      res.json({ liked: true });
    }
  } catch (err) {
    console.error("[reels] like error:", err);
    res.status(500).json({ error: "Failed to toggle like." });
  }
});

// ─── POST /api/reels/:reelId/comment ─────────────────────────────────────────

router.post("/reels/:reelId/comment", async (req, res) => {
  const { reelId } = req.params;
  const { username, fullName, message } = req.body as Record<string, unknown>;

  if (!username || !message || String(message).trim().length === 0) {
    res.status(400).json({ error: "username and message required." });
    return;
  }
  const msg = String(message).trim().slice(0, 500);
  if (!msg) { res.status(400).json({ error: "Message cannot be blank." }); return; }

  try {
    const [comment] = await db.insert(reelCommentsTable).values({
      reelId,
      username: String(username).slice(0, 50),
      fullName: String(fullName ?? username).slice(0, 100),
      message:  msg,
    }).returning();
    res.status(201).json(comment);
  } catch (err) {
    console.error("[reels] comment error:", err);
    res.status(500).json({ error: "Failed to post comment." });
  }
});

// ─── POST /api/reels/:reelId/view ────────────────────────────────────────────

router.post("/reels/:reelId/view", async (req, res) => {
  const { reelId } = req.params;
  try {
    await db.update(reelsTable)
      .set({ views: sql`${reelsTable.views} + 1` })
      .where(eq(reelsTable.reelId, reelId));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to increment view." });
  }
});

// ─── DELETE /api/reels/:reelId ────────────────────────────────────────────────

router.delete("/reels/:reelId", async (req, res) => {
  const { reelId }   = req.params;
  const { username } = req.body as Record<string, unknown>;
  if (!username) { res.status(400).json({ error: "username required" }); return; }

  try {
    const [reel] = await db
      .select({ username: reelsTable.username })
      .from(reelsTable)
      .where(eq(reelsTable.reelId, reelId))
      .limit(1);
    if (!reel) { res.status(404).json({ error: "Reel not found." }); return; }
    if (reel.username !== String(username)) {
      res.status(403).json({ error: "You can only delete your own reels." });
      return;
    }
    await db.delete(reelLikesTable).where(eq(reelLikesTable.reelId, reelId));
    await db.delete(reelCommentsTable).where(eq(reelCommentsTable.reelId, reelId));
    await db.delete(reelsTable).where(eq(reelsTable.reelId, reelId));
    res.json({ ok: true });
  } catch (err) {
    console.error("[reels] delete error:", err);
    res.status(500).json({ error: "Failed to delete reel." });
  }
});

export default router;
