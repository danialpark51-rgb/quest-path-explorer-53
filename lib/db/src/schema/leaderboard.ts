import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaderboardTable = pgTable("leaderboard_entries", {
  username:   text("username").primaryKey(),
  fullName:   text("full_name").notNull(),
  xp:         integer("xp").notNull().default(0),
  level:      integer("level").notNull().default(1),
  streak:     integer("streak").notNull().default(0),
  goal:       text("goal").notNull().default(""),
  school:     text("school").notNull().default(""),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboardTable);
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type LeaderboardEntry = typeof leaderboardTable.$inferSelect;
