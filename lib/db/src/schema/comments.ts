import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectCommentsTable = pgTable("project_comments", {
  id:         serial("id").primaryKey(),
  projectId:  integer("project_id").notNull(),
  username:   text("username").notNull(),
  fullName:   text("full_name").notNull(),
  message:    text("message").notNull(),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(projectCommentsTable).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type ProjectComment = typeof projectCommentsTable.$inferSelect;
