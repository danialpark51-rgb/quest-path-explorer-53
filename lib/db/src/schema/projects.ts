import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id:             serial("id").primaryKey(),
  username:       text("username").notNull(),
  fullName:       text("full_name").notNull(),
  title:          text("title").notNull(),
  description:    text("description").notNull(),
  subject:        text("subject").notNull(),
  goal:           text("goal").notNull().default(""),
  classStandard:  text("class_standard").notNull().default(""),
  school:         text("school").notNull().default(""),
  // Location fields — nullable so existing projects are not broken
  city:           text("city"),
  state:          text("state"),
  likes:          integer("likes").notNull().default(0),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, likes: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
