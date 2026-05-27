import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

// Sanitize a location text field — trim, remove control chars, cap length
function sanitizeLocation(val: unknown): string | null {
  if (val === undefined || val === null || val === "") return null;
  const s = String(val).replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, 100);
  return s.length > 0 ? s : null;
}

// GET /api/projects — fetch all projects, newest first
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

// POST /api/projects — create a project (location fields optional)
router.post("/projects", async (req, res) => {
  const { username, fullName, title, description, subject, goal, classStandard, school, city, state } =
    req.body as Record<string, unknown>;

  if (!username || !title || !description || !subject) {
    res.status(400).json({ error: "username, title, description, subject required" });
    return;
  }

  try {
    const [created] = await db
      .insert(projectsTable)
      .values({
        username:      String(username),
        fullName:      String(fullName ?? username),
        title:         String(title),
        description:   String(description),
        subject:       String(subject),
        goal:          String(goal ?? ""),
        classStandard: String(classStandard ?? ""),
        school:        String(school ?? ""),
        // Sanitize location — null if empty/missing so old data stays unaffected
        city:          sanitizeLocation(city),
        state:         sanitizeLocation(state),
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
