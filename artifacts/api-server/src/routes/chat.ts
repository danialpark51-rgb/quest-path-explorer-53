import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/chat", async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Invalid request body: messages array required" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    res
      .status(503)
      .json({ error: "AI service is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." });
    return;
  }

  const chatUrl = `${supabaseUrl}/functions/v1/chat`;

  try {
    const upstream = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ messages }),
    });

    res.status(upstream.status);

    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "content-type" || k === "transfer-encoding" || k === "cache-control") {
        res.setHeader(key, value);
      }
    });

    if (upstream.body) {
      const reader = upstream.body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        return pump();
      };
      await pump();
    } else {
      const body = await upstream.text();
      res.send(body);
    }
  } catch (_err) {
    res.status(502).json({ error: "Failed to reach AI service" });
  }
});

export default router;
