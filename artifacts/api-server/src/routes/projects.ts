import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/projects", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.createdAt))
      .limit(100);
    res.json({ projects: rows });
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/projects", async (req, res) => {
  const { username, fullName, title, description, subject, goal, classStandard, school } = req.body as Record<string, unknown>;
  if (!username || !title || !description || !subject) {
    res.status(400).json({ error: "username, title, description, subject required" });
    return;
  }
  try {
    const [created] = await db
      .insert(projectsTable)
      .values({
        username: String(username),
        fullName: String(fullName ?? username),
        title: String(title),
        description: String(description),
        subject: String(subject),
        goal: String(goal ?? ""),
        classStandard: String(classStandard ?? ""),
        school: String(school ?? ""),
      })
      .returning();
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.post("/projects/:id/like", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db
      .update(projectsTable)
      .set({ likes: sql`${projectsTable.likes} + 1` })
      .where(eq(projectsTable.id, id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to like project" });
  }
});

export default router;
