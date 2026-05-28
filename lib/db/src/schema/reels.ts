import { pgTable, text, integer, timestamp, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Reels Table ──────────────────────────────────────────────────────────────
// Stores reel metadata — actual video blob is downloaded client-side
export const reelsTable = pgTable("reels", {
  id:            serial("id").primaryKey(),
  reelId:        text("reel_id").notNull().unique(),    // nanoid UUID for external reference
  username:      text("username").notNull(),
  fullName:      text("full_name").notNull(),
  title:         text("title").notNull(),
  templateId:    text("template_id").notNull(),
  scenesJson:    text("scenes_json").notNull(),          // JSON array of ReelScene objects
  thumbnailData: text("thumbnail_data"),                 // base64 JPEG thumbnail from canvas
  hashtags:      text("hashtags").notNull().default(""), // comma-separated
  musicTrack:    text("music_track").notNull().default(""),
  goal:          text("goal").notNull().default(""),
  contentType:   text("content_type").notNull().default(""),
  likes:         integer("likes").notNull().default(0),
  views:         integer("views").notNull().default(0),
  isPublic:         boolean("is_public").notNull().default(true),
  videoUrl:         text("video_url"),                        // Pika-generated video URL
  pikaJobId:        text("pika_job_id"),                      // Pika async job ID for polling
  remixedFrom:      text("remixed_from"),                     // reelId of the original reel
  remixedFromUser:  text("remixed_from_user"),                // username of original creator
  createdAt:        timestamp("created_at").notNull().defaultNow(),
});

// ─── Reel Likes Table ─────────────────────────────────────────────────────────
// One row per (reelId, username) — prevents double-liking
export const reelLikesTable = pgTable("reel_likes", {
  id:        serial("id").primaryKey(),
  reelId:    text("reel_id").notNull(),
  username:  text("username").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Reel Comments Table ──────────────────────────────────────────────────────
export const reelCommentsTable = pgTable("reel_comments", {
  id:        serial("id").primaryKey(),
  reelId:    text("reel_id").notNull(),
  username:  text("username").notNull(),
  fullName:  text("full_name").notNull(),
  message:   text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReelSchema = createInsertSchema(reelsTable).omit({
  id: true, likes: true, views: true, createdAt: true,
});
export const insertReelCommentSchema = createInsertSchema(reelCommentsTable).omit({
  id: true, createdAt: true,
});

export type InsertReel    = z.infer<typeof insertReelSchema>;
export type Reel          = typeof reelsTable.$inferSelect;
export type ReelLike      = typeof reelLikesTable.$inferSelect;
export type ReelComment   = typeof reelCommentsTable.$inferSelect;
