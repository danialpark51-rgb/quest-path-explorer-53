import { Router, type IRouter } from "express";
import { db, projectCommentsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/projects/:id/comments", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const rows = await db
      .select()
      .from(projectCommentsTable)
      .where(eq(projectCommentsTable.projectId, id))
      .orderBy(asc(projectCommentsTable.createdAt));
    res.json({ comments: rows });
  } catch {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/projects/:id/comments", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { username, fullName, message } = req.body as Record<string, unknown>;
  if (!username || !message || String(message).trim().length === 0) {
    res.status(400).json({ error: "username and message required" });
    return;
  }
  try {
    const [created] = await db
      .insert(projectCommentsTable)
      .values({
        projectId: id,
        username: String(username),
        fullName: String(fullName ?? username),
        message: String(message).trim().slice(0, 500),
      })
      .returning();
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to post comment" });
  }
});

export default router;
