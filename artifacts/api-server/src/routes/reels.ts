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
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";

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

// ─── APIMALL Hailuo Video Generation ─────────────────────────────────────────
//
// Uses the APIMALL gateway to call the Hailuo (MiniMax) text-to-video model.
// API key: APIMALL_AI environment secret (Bearer token format).
// Base URL: https://api.apimall.ai
//
// Async flow (two-step):
//   POST /v1/video/generations          → { id }            (job submitted)
//   GET  /v1/video/generations/{id}     → { status, video } (poll for result)
//
// Status values: pending | processing | completed | failed

const APIMALL_BASE = "https://api.apimall.ai";

// Models to try in order. The provider field is passed back to the frontend
// and echoed when polling, so the same poll endpoint handles all models.
const HAILUO_MODELS = [
  "hailuo-v1",      // Hailuo 1 — standard quality, widely available
  "hailuo-v1-live", // Hailuo Live variant — same price, sometimes higher availability
  "minimax-video-01", // MiniMax direct name used by some APIMALL routes
];

type HailuoStatusResult = {
  status: "pending" | "processing" | "finished" | "failed";
  videoUrl?: string;
};

/** fetch() with automatic retry on transient errors (network / 429 / 5xx). */
async function fetchWithRetry(
  url: string,
  opts: RequestInit,
  maxRetries = 2,
): Promise<Response> {
  let lastErr: Error = new Error("unknown");
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (attempt < maxRetries && (res.status === 429 || res.status >= 500)) {
        const delay = 1000 * Math.pow(2, attempt);
        console.warn(`[hailuo] HTTP ${res.status}, retrying in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e as Error;
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt);
        console.warn(`[hailuo] fetch threw "${lastErr.message}", retrying in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

/** Build an optimised text-to-video prompt for educational reels. */
function buildVideoPrompt(
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
    "Format: vertical 9:16, 5 seconds, studio-quality.",
  ].filter(Boolean).join(" ").slice(0, 600);
}

/** Download a fal.ai video to local /uploads/ so it persists permanently. */
async function downloadAndSaveFalVideo(falUrl: string): Promise<string | null> {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

    const res = await fetch(falUrl, { signal: AbortSignal.timeout(120_000) });
    if (!res.ok || !res.body) {
      console.warn("[fal] download failed, status:", res.status);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "video/mp4";
    const ext = contentType.includes("webm") ? "webm" : "mp4";
    const filename = `fal-${randomBytes(10).toString("hex")}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(filepath, buffer);
    console.log("[fal] saved video locally:", filename, `(${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
    return `/uploads/${filename}`;
  } catch (e) {
    console.warn("[fal] failed to download video:", (e as Error).message);
    return null;
  }
}

/** Submit a Hailuo video generation job via APIMALL. Returns jobId + provider on success. */
async function startHailuoGeneration(
  prompt: string,
): Promise<{ jobId: string; provider: string } | { error: string }> {
  const apiKey = process.env.APIMALL_AI;
  if (!apiKey) {
    return { error: "APIMALL_AI secret not configured. Add it in Replit Secrets." };
  }

  const errors: string[] = [];

  for (const model of HAILUO_MODELS) {
    try {
      console.log(`[hailuo] trying model: ${model}`);

      const r = await fetchWithRetry(
        `${APIMALL_BASE}/v1/video/generations`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            prompt,
            prompt_optimizer: true,
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );

      const rawText = await r.text();
      console.log(`[hailuo] ${model} → HTTP ${r.status}:`, rawText.slice(0, 300));

      if (r.ok) {
        let d: { id?: string; task_id?: string; request_id?: string } = {};
        try { d = JSON.parse(rawText); } catch { /* ignore */ }

        // APIMALL may return id, task_id, or request_id depending on the route version
        const jobId = d.id ?? d.task_id ?? d.request_id;
        if (jobId) {
          console.log(`[hailuo] ✓ submitted ${model}, jobId: ${jobId}`);
          return { jobId: String(jobId), provider: model };
        }
        const msg = `HTTP 200 but no job id — body: ${rawText.slice(0, 200)}`;
        console.warn(`[hailuo] ${model}: ${msg}`);
        errors.push(`${model}: ${msg}`);
      } else {
        // Detect billing / auth errors — all models will fail the same way
        let parsed: { error?: string | { message?: string }; detail?: string; message?: string } = {};
        try { parsed = JSON.parse(rawText); } catch { /* ignore */ }

        const errMsg = (
          (typeof parsed.error === "string" ? parsed.error : parsed.error?.message) ??
          parsed.detail ??
          parsed.message ??
          ""
        ).toLowerCase();

        const isBillingError =
          r.status === 403 &&
          (errMsg.includes("balance") || errMsg.includes("credit") ||
           errMsg.includes("quota") || errMsg.includes("locked"));

        const isAuthError = r.status === 401 || r.status === 403 && errMsg.includes("invalid");

        if (isBillingError) {
          console.error("[hailuo] account out of credits — stopping");
          return {
            error: "BILLING_ERROR: Your APIMALL account has insufficient credits. " +
              "Please top up at https://apimall.ai/dashboard and try again.",
          };
        }
        if (isAuthError) {
          console.error("[hailuo] auth error — check APIMALL_AI key");
          return {
            error: "AUTH_ERROR: Invalid APIMALL_AI API key. " +
              "Please verify the key in your Replit Secrets.",
          };
        }

        const msg = `HTTP ${r.status} — ${rawText.slice(0, 300)}`;
        console.warn(`[hailuo] ${model}: ${msg}`);
        errors.push(`${model}: ${msg}`);
      }
    } catch (e) {
      const msg = (e as Error).message;
      console.warn(`[hailuo] ${model} threw: ${msg}`);
      errors.push(`${model}: ${msg}`);
    }
  }

  const detail = errors.join(" | ");
  console.error("[hailuo] all models failed:", detail);
  return { error: `AI video generation failed. Details: ${detail}` };
}

/** Poll a Hailuo job for completion via APIMALL. */
async function getHailuoStatus(jobId: string): Promise<HailuoStatusResult> {
  const apiKey = process.env.APIMALL_AI;
  if (!apiKey) return { status: "failed" };

  try {
    const r = await fetch(`${APIMALL_BASE}/v1/video/generations/${jobId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });

    if (!r.ok) {
      console.warn(`[hailuo] poll HTTP ${r.status} for job ${jobId}`);
      return { status: "processing" };
    }

    const data = await r.json() as {
      status?: string;
      state?: string;
      video?: { url?: string };
      output?: { url?: string; video_url?: string };
      file_id?: string;
      file_url?: string;
      result?: { url?: string };
    };

    const rawStatus = (data.status ?? data.state ?? "").toLowerCase();
    console.log(`[hailuo] job ${jobId} status: ${rawStatus}`);

    if (rawStatus === "completed" || rawStatus === "succeeded" || rawStatus === "success") {
      // Normalise across APIMALL response shapes
      const remoteUrl =
        data.video?.url ??
        data.output?.url ??
        data.output?.video_url ??
        data.file_url ??
        data.result?.url;

      console.log("[hailuo] finished, remote videoUrl:", remoteUrl?.slice(0, 100));

      if (remoteUrl) {
        // Download to /uploads/ so the URL persists permanently
        const localUrl = await downloadAndSaveFalVideo(remoteUrl);
        return { status: "finished", videoUrl: localUrl ?? remoteUrl };
      }
      return { status: "finished" };
    }

    if (rawStatus === "failed" || rawStatus === "error" || rawStatus === "cancelled") {
      return { status: "failed" };
    }

    // pending / processing / in_progress / queued
    return { status: "processing" };
  } catch (e) {
    console.warn("[hailuo] poll error:", (e as Error).message);
    return { status: "processing" };
  }
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
      videoUrl:        videoUrl        ? String(videoUrl).slice(0, 5_000_000)   : null,
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

// ─── POST /api/reels/upload-video ────────────────────────────────────────────
// Accepts a base64-encoded video blob and saves it to disk.
// Returns { videoUrl: "/uploads/reel-XXXX.webm" } for feed playback.

router.post("/reels/upload-video", async (req, res) => {
  const { videoData, mimeType } = req.body as { videoData?: string; mimeType?: string };
  if (!videoData) {
    res.status(400).json({ error: "videoData (base64) required" });
    return;
  }

  const ext      = (mimeType ?? "video/webm").includes("mp4") ? "mp4" : "webm";
  const filename = `reel-${randomBytes(10).toString("hex")}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "uploads");

  try {
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
    const buffer = Buffer.from(videoData, "base64");
    writeFileSync(path.join(uploadsDir, filename), buffer);
    console.log("[upload] saved canvas video:", filename, `(${(buffer.length / 1024).toFixed(0)} KB)`);
    res.json({ videoUrl: `/uploads/${filename}` });
  } catch (err) {
    console.error("[upload] failed to save video:", err);
    res.status(500).json({ error: "Failed to save video file." });
  }
});

// ─── POST /api/reels/pika-generate ───────────────────────────────────────────
// Submits a Hailuo (APIMALL) video generation job.
// Endpoint name kept as-is for frontend compatibility.
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

  const prompt = buildVideoPrompt(
    String(title ?? "Student Achievement"),
    scenes ?? [],
    String(templateName ?? "Study Motivation"),
    gradientColors ?? ["#6C3483", "#1A5276"],
  );

  console.log("[hailuo] generating with prompt:", prompt.slice(0, 120), "…");

  const result = await startHailuoGeneration(prompt);

  if ("error" in result) {
    res.status(503).json({ error: result.error });
    return;
  }

  res.json({ jobId: result.jobId, provider: result.provider });
});

// ─── GET /api/reels/pika-status/:jobId ───────────────────────────────────────
// Polls the Hailuo (APIMALL) job status.
// Endpoint name kept as-is for frontend compatibility.
// Returns { status: "pending"|"processing"|"finished"|"failed", videoUrl? }

router.get("/reels/pika-status/:jobId", async (req, res) => {
  const { jobId } = req.params;
  // provider param accepted for compatibility but not needed for APIMALL polling
  const result = await getHailuoStatus(jobId);
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
