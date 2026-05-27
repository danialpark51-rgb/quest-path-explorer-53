import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { leaderboardTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/leaderboard", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(leaderboardTable)
      .orderBy(desc(leaderboardTable.xp))
      .limit(50);
    res.json({ players: rows });
  } catch {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.post("/leaderboard/sync", async (req, res) => {
  const { username, fullName, xp, level, streak, goal, school } = req.body as Record<string, unknown>;
  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "username required" });
    return;
  }
  try {
    await db
      .insert(leaderboardTable)
      .values({
        username: String(username),
        fullName: String(fullName ?? username),
        xp: Number(xp ?? 0),
        level: Number(level ?? 1),
        streak: Number(streak ?? 0),
        goal: String(goal ?? ""),
        school: String(school ?? ""),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: leaderboardTable.username,
        set: {
          fullName: String(fullName ?? username),
          xp: Number(xp ?? 0),
          level: Number(level ?? 1),
          streak: Number(streak ?? 0),
          goal: String(goal ?? ""),
          school: String(school ?? ""),
          updatedAt: new Date(),
        },
      });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to sync leaderboard" });
  }
});

export default router;
