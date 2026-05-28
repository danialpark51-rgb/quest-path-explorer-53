import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api", router);

// ─── Serve uploaded reel videos ───────────────────────────────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  const staticDir = path.join(process.cwd(), "artifacts/eduapp/dist/public");

  if (existsSync(staticDir)) {
    app.use(express.static(staticDir));

    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });

    logger.info({ staticDir }, "Serving frontend static files");
  } else {
    logger.warn({ staticDir }, "Frontend build not found — static serving skipped");
  }
}

export default app;
