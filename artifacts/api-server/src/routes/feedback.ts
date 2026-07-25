/**
 * POST /api/feedback  — submit user feedback
 * GET  /api/feedback  — health check (admin use)
 *
 * Feedback is stored in uploads/feedback.json (file-based, no DB required).
 */

import { Router, type IRouter } from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const router: IRouter = Router();

const FEEDBACK_DIR  = path.join(process.cwd(), "uploads");
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, "feedback.json");

interface FeedbackEntry {
  id: string;
  timestamp: string;
  username: string;
  rating: number;
  category: string;
  message: string;
  suggestions: string;
  bugReport: string;
  featureRequest: string;
}

function loadFeedback(): FeedbackEntry[] {
  try {
    if (!existsSync(FEEDBACK_FILE)) return [];
    return JSON.parse(readFileSync(FEEDBACK_FILE, "utf-8")) as FeedbackEntry[];
  } catch {
    return [];
  }
}

function saveFeedback(entries: FeedbackEntry[]): void {
  if (!existsSync(FEEDBACK_DIR)) mkdirSync(FEEDBACK_DIR, { recursive: true });
  writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

// POST /api/feedback
router.post("/feedback", (req, res) => {
  const { username, rating, category, message, suggestions, bugReport, featureRequest } =
    req.body as Record<string, unknown>;

  // Validate required fields
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    return;
  }

  if (!message || typeof message !== "string" || message.trim().length < 5) {
    res.status(400).json({ error: "Please provide a feedback message (at least 5 characters)." });
    return;
  }

  if (message.trim().length > 2000) {
    res.status(400).json({ error: "Feedback message is too long (max 2000 characters)." });
    return;
  }

  const entry: FeedbackEntry = {
    id:             `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp:      new Date().toISOString(),
    username:       typeof username === "string" ? username.trim().slice(0, 100) : "anonymous",
    rating:         Math.round(rating),
    category:       typeof category === "string" ? category.slice(0, 50) : "general",
    message:        message.trim().slice(0, 2000),
    suggestions:    typeof suggestions === "string" ? suggestions.trim().slice(0, 1000) : "",
    bugReport:      typeof bugReport  === "string" ? bugReport.trim().slice(0, 1000)  : "",
    featureRequest: typeof featureRequest === "string" ? featureRequest.trim().slice(0, 1000) : "",
  };

  try {
    const existing = loadFeedback();

    // Rate-limit: same username cannot submit more than 5 times per hour
    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const recentFromUser = existing.filter(
      (f) => f.username === entry.username && f.timestamp > oneHourAgo
    );
    if (recentFromUser.length >= 5) {
      res.status(429).json({ error: "Too many submissions. Please wait before submitting again." });
      return;
    }

    existing.push(entry);
    saveFeedback(existing);

    res.json({
      success: true,
      id: entry.id,
      message: "Thank you for your feedback! It helps us improve EduPath for everyone.",
    });
  } catch (err) {
    console.error("[feedback] Failed to save:", err);
    res.status(500).json({ error: "Failed to save feedback. Please try again." });
  }
});

// GET /api/feedback/count — returns submission count (no sensitive data)
router.get("/feedback/count", (_req, res) => {
  const entries = loadFeedback();
  res.json({ total: entries.length });
});

export default router;
