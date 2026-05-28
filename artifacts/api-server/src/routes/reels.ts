/**
 * Skill Reels AI Studio — API Routes
 *
 * Endpoints:
 *   GET  /api/reels                      – Paginated public feed
 *   GET  /api/reels/trending             – Trending hashtags (AI-powered mock)
 *   GET  /api/reels/leaderboard          – Top reels by likes
 *   GET  /api/reels/user/:username       – A user's own reels
 *   GET  /api/reels/:reelId              – Single reel detail
 *   GET  /api/reels/:reelId/comments     – Comments on a reel
 *   POST /api/reels                      – Publish a new reel
 *   POST /api/reels/generate             – AI scene + hashtag generation
 *   POST /api/reels/:reelId/like         – Toggle like (prevents double-like)
 *   POST /api/reels/:reelId/comment      – Add a comment
 *   POST /api/reels/:reelId/view         – Increment view counter
 *   DELETE /api/reels/:reelId            – Delete own reel
 */

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  reelsTable, reelLikesTable, reelCommentsTable,
} from "@workspace/db";
import { eq, desc, asc, sql, and } from "drizzle-orm";

const router: IRouter = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a simple unique ID for reels (nanoid-style without the dependency) */
function generateReelId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Call Replit AI (OpenAI-compatible) for AI generation features */
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

// ─── GET /api/reels ──────────────────────────────────────────────────────────
// Returns public reels newest-first (paginated, default 30)
router.get("/reels", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 30), 100);
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
        likes: reelsTable.likes, views: reelsTable.views, createdAt: reelsTable.createdAt,
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

// ─── GET /api/reels/trending ─────────────────────────────────────────────────
// Returns trending hashtags tailored to the caller's goal
// TODO: Replace mock with a real trending API (TikTok API, Twitter/X Trends API)
router.get("/reels/trending", (req, res) => {
  const goal = String(req.query.goal ?? "");

  // Base trending tags that are always popular
  const baseTags = ["#EduPath", "#StudentLife", "#Learning2025", "#IndiaStudents", "#Viral"];

  // Goal-specific trending hashtags (mock — mimics social media trends)
  const goalTags: Record<string, string[]> = {
    Engineering: ["#JEE2025", "#IITDream", "#STEM", "#CodeLife", "#EnggStudent"],
    Medical:     ["#NEET2025", "#MedStudent", "#Doctor", "#MBBS", "#Biology"],
    Commerce:    ["#CA2025", "#Finance", "#Entrepreneur", "#Business", "#Commerce"],
    Arts:        ["#ArtLife", "#Creative", "#Design", "#Talent", "#NID"],
    IT:          ["#CodeLife", "#Programming", "#WebDev", "#TechTok", "#Python"],
    Defence:     ["#NDA2025", "#ArmyLife", "#Patriot", "#Defence", "#Soldier"],
    Govt:        ["#UPSC2025", "#IAS", "#SSC", "#GovtJob", "#CivilServices"],
  };

  const trending = [...baseTags, ...(goalTags[goal] ?? ["#StudyMotivation", "#SchoolLife", "#Goals"])];
  res.json({ hashtags: [...new Set(trending)].slice(0, 15) });
});

// ─── GET /api/reels/leaderboard ──────────────────────────────────────────────
// Returns top 10 reels sorted by likes
router.get("/reels/leaderboard", async (_req, res) => {
  try {
    const rows = await db
      .select({
        reelId: reelsTable.reelId, username: reelsTable.username,
        fullName: reelsTable.fullName, title: reelsTable.title,
        templateId: reelsTable.templateId, thumbnailData: reelsTable.thumbnailData,
        likes: reelsTable.likes, views: reelsTable.views,
        hashtags: reelsTable.hashtags, createdAt: reelsTable.createdAt,
      })
      .from(reelsTable)
      .where(eq(reelsTable.isPublic, true))
      .orderBy(desc(reelsTable.likes))
      .limit(10);
    res.json({ leaderboard: rows });
  } catch (err) {
    console.error("[reels] GET /reels/leaderboard error:", err);
    res.status(500).json({ error: "Failed to load leaderboard." });
  }
});

// ─── GET /api/reels/user/:username ───────────────────────────────────────────
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
    console.error("[reels] GET /reels/user error:", err);
    res.status(500).json({ error: "Failed to load user reels." });
  }
});

// ─── GET /api/reels/:reelId ───────────────────────────────────────────────────
router.get("/reels/:reelId", async (req, res) => {
  const { reelId } = req.params;
  try {
    const [reel] = await db.select().from(reelsTable).where(eq(reelsTable.reelId, reelId)).limit(1);
    if (!reel) { res.status(404).json({ error: "Reel not found" }); return; }
    res.json(reel);
  } catch (err) {
    console.error("[reels] GET /reels/:reelId error:", err);
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
// Publishes a new reel. scenesJson must be a valid JSON string array.
router.post("/reels", async (req, res) => {
  const {
    username, fullName, title, templateId, scenesJson,
    thumbnailData, hashtags, musicTrack, goal, contentType,
  } = req.body as Record<string, unknown>;

  if (!username || !title || !templateId || !scenesJson) {
    res.status(400).json({ error: "username, title, templateId, scenesJson are required." });
    return;
  }

  // Validate scenesJson is valid JSON
  try { JSON.parse(String(scenesJson)); } catch {
    res.status(400).json({ error: "scenesJson must be a valid JSON string." });
    return;
  }

  try {
    const reelId = generateReelId();
    const [created] = await db.insert(reelsTable).values({
      reelId,
      username:      String(username).slice(0, 50),
      fullName:      String(fullName ?? username).slice(0, 100),
      title:         String(title).trim().slice(0, 120),
      templateId:    String(templateId),
      scenesJson:    String(scenesJson),
      thumbnailData: thumbnailData ? String(thumbnailData).slice(0, 200_000) : null,
      hashtags:      String(hashtags ?? "").slice(0, 500),
      musicTrack:    String(musicTrack ?? "").slice(0, 50),
      goal:          String(goal ?? "").slice(0, 50),
      contentType:   String(contentType ?? "").slice(0, 30),
    }).returning();
    res.status(201).json(created);
  } catch (err) {
    console.error("[reels] POST /reels error:", err);
    res.status(500).json({ error: "Failed to publish reel." });
  }
});

// ─── POST /api/reels/generate ────────────────────────────────────────────────
// Uses AI to generate optimized scenes + hashtags from user content.
// Plug Runway / Pika / Sora here when real video generation is needed.
router.post("/reels/generate", async (req, res) => {
  const { title, subtitle, contentType, score, goal } = req.body as Record<string, unknown>;

  const safeTitle       = String(title ?? "My Achievement").slice(0, 100);
  const safeSubtitle    = String(subtitle ?? "").slice(0, 100);
  const safeContentType = String(contentType ?? "achievement");
  const safeScore       = String(score ?? "");
  const safeGoal        = String(goal ?? "");

  // Build a detailed AI prompt for creative reel scene generation
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
    // Fallback: return sensible default scenes if AI is unavailable
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

  // Extract JSON from AI response (strip potential markdown fences)
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

// ─── POST /api/reels/:reelId/like ────────────────────────────────────────────
// Toggles like: adds if not already liked, removes if already liked.
router.post("/reels/:reelId/like", async (req, res) => {
  const { reelId } = req.params;
  const { username } = req.body as Record<string, unknown>;
  if (!username) { res.status(400).json({ error: "username required" }); return; }

  try {
    // Check if already liked
    const [existing] = await db
      .select()
      .from(reelLikesTable)
      .where(and(eq(reelLikesTable.reelId, reelId), eq(reelLikesTable.username, String(username))))
      .limit(1);

    if (existing) {
      // Unlike: remove the like row and decrement counter
      await db.delete(reelLikesTable).where(eq(reelLikesTable.id, existing.id));
      await db.update(reelsTable)
        .set({ likes: sql`GREATEST(${reelsTable.likes} - 1, 0)` })
        .where(eq(reelsTable.reelId, reelId));
      res.json({ liked: false });
    } else {
      // Like: insert row and increment counter
      await db.insert(reelLikesTable).values({ reelId, username: String(username) });
      await db.update(reelsTable)
        .set({ likes: sql`${reelsTable.likes} + 1` })
        .where(eq(reelsTable.reelId, reelId));
      res.json({ liked: true });
    }
  } catch (err) {
    console.error("[reels] POST like error:", err);
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
  if (msg.length === 0) { res.status(400).json({ error: "Message cannot be blank." }); return; }

  try {
    const [comment] = await db.insert(reelCommentsTable).values({
      reelId,
      username:  String(username).slice(0, 50),
      fullName:  String(fullName ?? username).slice(0, 100),
      message:   msg,
    }).returning();
    res.status(201).json(comment);
  } catch (err) {
    console.error("[reels] POST comment error:", err);
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

// ─── DELETE /api/reels/:reelId ───────────────────────────────────────────────
router.delete("/reels/:reelId", async (req, res) => {
  const { reelId } = req.params;
  const { username } = req.body as Record<string, unknown>;
  if (!username) { res.status(400).json({ error: "username required" }); return; }

  try {
    const [reel] = await db.select({ username: reelsTable.username })
      .from(reelsTable).where(eq(reelsTable.reelId, reelId)).limit(1);

    if (!reel) { res.status(404).json({ error: "Reel not found." }); return; }
    if (reel.username !== String(username)) {
      res.status(403).json({ error: "You can only delete your own reels." });
      return;
    }

    // Cascade delete likes and comments
    await db.delete(reelLikesTable).where(eq(reelLikesTable.reelId, reelId));
    await db.delete(reelCommentsTable).where(eq(reelCommentsTable.reelId, reelId));
    await db.delete(reelsTable).where(eq(reelsTable.reelId, reelId));
    res.json({ ok: true });
  } catch (err) {
    console.error("[reels] DELETE error:", err);
    res.status(500).json({ error: "Failed to delete reel." });
  }
});

export default router;
