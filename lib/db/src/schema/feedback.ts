/**
 * Feedback table schema (Drizzle ORM).
 * Used if a PostgreSQL database is connected via DATABASE_URL.
 * The /api/feedback route uses file-based storage as fallback.
 */

import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const feedback = pgTable("feedback", {
  id:             text("id").primaryKey(),
  username:       text("username").notNull().default("anonymous"),
  rating:         integer("rating").notNull(),
  category:       text("category").notNull().default("general"),
  message:        text("message").notNull(),
  suggestions:    text("suggestions").default(""),
  bugReport:      text("bug_report").default(""),
  featureRequest: text("feature_request").default(""),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});
