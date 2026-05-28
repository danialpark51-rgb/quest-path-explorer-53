---
name: Pika API integration
description: How the Pika video generation API is wired into the Reels feature, including endpoint strategy and key format.
---

# Pika API Integration

**Why:** Pika's public API access paths are confusing — there is no single canonical public REST endpoint. The API key format `uuid:hash` is the Pika partner/beta direct API format, but `api.pika.art` may not always respond. The pikapikapika.io community wrapper (same Bearer token) is a reliable fallback.

**How to apply:** The backend (`artifacts/api-server/src/routes/reels.ts`) tries:
1. `POST https://api.pika.art/v1/generate/text` (Pika direct)
2. `POST https://api.pikapikapika.io/web/generate` (community wrapper fallback)

Polling uses the matching GET endpoint for whichever provider responded.

**Key:** Stored as `PIKA_API_KEY` Replit secret. Format: `{uuid}:{32-char-hex}`.

**Frontend polling:** Studio page polls `GET /api/reels/pika-status/:jobId?provider={provider}` every 4 seconds with a 3-minute max timeout. Progress bar is simulated (0→90% over ~80s).

**Video URL storage:** Pika returns a CDN URL stored in `reels.video_url` column (nullable text). These URLs are temporary (24–48h) — future work could download and re-host them.
