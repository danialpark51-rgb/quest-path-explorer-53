import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectsTable, projectCommentsTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";

const router: IRouter = Router();

function sanitizeLocation(val: unknown): string | null {
  if (val === undefined || val === null || val === "") return null;
  const s = String(val).replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, 100);
  return s.length > 0 ? s : null;
}

function sanitizeText(val: unknown, max: number): string | null {
  if (val === undefined || val === null) return null;
  const s = String(val).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, max);
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

// POST /api/projects — create a project
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
        title:         String(title).trim().slice(0, 100),
        description:   String(description).trim().slice(0, 1000),
        subject:       String(subject),
        goal:          String(goal ?? ""),
        classStandard: String(classStandard ?? ""),
        school:        String(school ?? ""),
        city:          sanitizeLocation(city),
        state:         sanitizeLocation(state),
      })
      .returning();
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT /api/projects/:id — edit own project (title, description, subject, city, state)
router.put("/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { username, title, description, subject, city, state } =
    req.body as Record<string, unknown>;

  if (!username) { res.status(400).json({ error: "username required" }); return; }

  // Verify ownership before updating
  const [existing] = await db
    .select({ username: projectsTable.username })
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Project not found" }); return; }
  if (existing.username !== String(username)) {
    res.status(403).json({ error: "You can only edit your own projects" });
    return;
  }

  // Build update payload — only update fields that are provided
  type UpdatePayload = {
    title?: string; description?: string; subject?: string;
    city?: string | null; state?: string | null;
  };
  const updates: UpdatePayload = {};
  if (title)       updates.title       = sanitizeText(title, 100) ?? existing.username;
  if (description) updates.description = sanitizeText(description, 1000) ?? "";
  if (subject)     updates.subject     = String(subject);
  // Location: always update if key present (allow clearing to null)
  if ("city"  in (req.body as object)) updates.city  = sanitizeLocation(city);
  if ("state" in (req.body as object)) updates.state = sanitizeLocation(state);

  try {
    const [updated] = await db
      .update(projectsTable)
      .set(updates)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.username, String(username))))
      .returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id — delete own project (cascades comments)
router.delete("/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { username } = req.body as Record<string, unknown>;
  if (!username) { res.status(400).json({ error: "username required" }); return; }

  const [existing] = await db
    .select({ username: projectsTable.username })
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Project not found" }); return; }
  if (existing.username !== String(username)) {
    res.status(403).json({ error: "You can only delete your own projects" });
    return;
  }

  try {
    // Delete comments first, then the project
    await db.delete(projectCommentsTable).where(eq(projectCommentsTable.projectId, id));
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// POST /api/projects/:id/like
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
