/**
 * ReelRenderer — Canvas-based reel animation engine
 *
 * Renders a 9:16 portrait canvas (540×960) animated through scenes.
 * Supports:
 *  - Preview mode: continuous looping animation via requestAnimationFrame
 *  - Record mode:  captures canvas stream → MediaRecorder → WebM/MP4 video blob
 *
 * To integrate a real AI video API (Runway ML, Pika Labs, Sora, Kling):
 *   Replace the MediaRecorder capture logic in `startRecording` with a call to
 *   POST /api/reels/generate-video, passing scenesJson and template. The server
 *   forwards to the video generation API and returns a URL.
 */

import {
  useRef, useEffect, useCallback, useState,
  forwardRef, useImperativeHandle,
} from "react";
import type { ReelScene, ReelTemplate } from "@/data/reelTemplates";

// Canvas resolution — 9:16 portrait (half of 1080×1920 for GPU performance)
const CW = 540;
const CH = 960;

// ─── Public handle exposed via ref ───────────────────────────────────────────
export interface ReelRendererHandle {
  startRecording: () => void;
  stopRecording: () => void;
  getThumbnail: () => string; // returns base64 JPEG
}

interface ReelRendererProps {
  scenes: ReelScene[];
  template: ReelTemplate;
  onRecordComplete?: (blob: Blob, thumbnailDataUrl: string) => void;
  onProgress?: (progress: number) => void; // 0→1 during recording
  displayWidth?: number;  // CSS pixel width for the <canvas> element
}

// ─── Canvas drawing utilities ─────────────────────────────────────────────────

/** Ease-in-out cubic */
function eio(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Wrap long text into lines that fit maxWidth */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Draw a rounded rectangle path (does not fill/stroke) */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Core draw function — renders one frame onto the canvas.
 *
 * @param sceneProgress  0→1 position within the current scene
 * @param overallProgress 0→1 position across the entire reel
 */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  scene: ReelScene,
  tpl: ReelTemplate,
  sceneProgress: number,
  overallProgress: number,
  images: Map<string, HTMLImageElement>,
) {
  ctx.clearRect(0, 0, CW, CH);

  // ── Background gradient ───────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, CW * 0.6, CH);
  bg.addColorStop(0, tpl.gradient[0]);
  bg.addColorStop(1, tpl.gradient[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CW, CH);

  // ── Scene image (cover-fit) ───────────────────────────────────────────────
  if (scene.imageUrl) {
    const img = images.get(scene.imageUrl);
    if (img && img.complete) {
      const scale = Math.max(CW / img.width, CH / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      ctx.save();
      ctx.globalAlpha = Math.min(1, sceneProgress / 0.25) * 0.65;
      ctx.drawImage(img, (CW - iw) / 2, (CH - ih) / 2, iw, ih);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // ── Dark vignette overlay ─────────────────────────────────────────────────
  const vig = ctx.createRadialGradient(CW / 2, CH / 2, CH * 0.1, CW / 2, CH / 2, CH * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, `rgba(0,0,0,${tpl.overlayOpacity + 0.2})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, CW, CH);

  // Bottom gradient for text legibility
  const btm = ctx.createLinearGradient(0, CH * 0.45, 0, CH);
  btm.addColorStop(0, "rgba(0,0,0,0)");
  btm.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = btm;
  ctx.fillRect(0, 0, CW, CH);

  // ── Fade-in / fade-out alpha ───────────────────────────────────────────────
  const fadeIn  = Math.min(1, sceneProgress / 0.18);
  const fadeOut = sceneProgress > 0.82 ? Math.max(0, 1 - (sceneProgress - 0.82) / 0.18) : 1;
  const alpha   = Math.min(fadeIn, fadeOut);

  // ── Logo watermark ─────────────────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = alpha * 0.92;
  ctx.font = `bold 20px "Space Grotesk", "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = tpl.textColor;
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 8;
  ctx.fillText("📚 EduPath", 28, 56);
  ctx.restore();

  // ── Text position based on layout ─────────────────────────────────────────
  let textCY = CH * 0.5;
  if (tpl.layout === "bottom-third") textCY = CH * 0.67;
  if (tpl.layout === "top-heavy")    textCY = CH * 0.35;

  // ── Slide / zoom transform ────────────────────────────────────────────────
  const slideY = tpl.transition === "slide-up"
    ? (1 - eio(Math.min(1, sceneProgress / 0.35))) * 90 : 0;
  const zoomS = tpl.transition === "zoom"
    ? 0.65 + 0.35 * eio(Math.min(1, sceneProgress / 0.4)) : 1;
  const bounceS = tpl.transition === "bounce"
    ? 1 + 0.08 * Math.sin(Math.min(1, sceneProgress / 0.35) * Math.PI) : 1;

  ctx.save();
  ctx.globalAlpha = alpha;

  const finalScale = zoomS * bounceS;
  if (finalScale !== 1) {
    ctx.translate(CW / 2, textCY);
    ctx.scale(finalScale, finalScale);
    ctx.translate(-CW / 2, -textCY);
  }

  // ── Accent bar ────────────────────────────────────────────────────────────
  const barW = 64 * eio(Math.min(1, sceneProgress / 0.4));
  ctx.fillStyle = tpl.accent;
  ctx.fillRect(CW / 2 - barW / 2, textCY - tpl.titleSize * 1.5 - 18, barW, 5);

  // ── Title ─────────────────────────────────────────────────────────────────
  ctx.font = `bold ${tpl.titleSize}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = tpl.textColor;
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 14;

  const titleLines = wrapText(ctx, scene.text, CW - 72);
  const lh = tpl.titleSize * 1.22;
  const totalH = titleLines.length * lh;
  const titleTop = textCY - totalH / 2 + slideY;

  titleLines.forEach((line, i) => {
    ctx.fillText(line, CW / 2, titleTop + i * lh);
  });

  // ── Subtext ───────────────────────────────────────────────────────────────
  if (scene.subtext) {
    ctx.shadowBlur = 6;
    ctx.font = `500 ${tpl.subtitleSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = tpl.subtextColor;
    const subTop = titleTop + totalH + tpl.subtitleSize * 1.1 + slideY;
    const subLines = wrapText(ctx, scene.subtext, CW - 100);
    subLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, CW / 2, subTop + i * (tpl.subtitleSize * 1.38));
    });
  }

  ctx.shadowBlur = 0;
  ctx.restore();

  // ── Caption pill ──────────────────────────────────────────────────────────
  if (scene.caption) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const capH = 50;
    const capY = CH - capH - 86;
    roundRect(ctx, 28, capY, CW - 56, capH, 14);
    ctx.fillStyle = `${tpl.captionBg}CC`;
    ctx.fill();
    ctx.font = `600 ${Math.max(14, tpl.subtitleSize - 6)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = tpl.captionText;
    ctx.textAlign = "center";
    ctx.fillText(
      scene.caption.length > 50 ? scene.caption.slice(0, 47) + "…" : scene.caption,
      CW / 2, capY + capH / 2 + 6,
    );
    ctx.restore();
  }

  // ── Progress bar ──────────────────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(28, CH - 28, CW - 56, 5);
  ctx.fillStyle = tpl.accent;
  ctx.fillRect(28, CH - 28, (CW - 56) * Math.min(1, overallProgress), 5);
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

const ReelRenderer = forwardRef<ReelRendererHandle, ReelRendererProps>(
  ({ scenes, template, onRecordComplete, onProgress, displayWidth = 270 }, ref) => {
    const canvasRef   = useRef<HTMLCanvasElement>(null);
    const rafRef      = useRef<number>(0);
    const startRef    = useRef<number>(0);
    const recRef      = useRef<MediaRecorder | null>(null);
    const chunksRef   = useRef<Blob[]>([]);
    const imagesRef   = useRef<Map<string, HTMLImageElement>>(new Map());
    const [isRec, setIsRec]     = useState(false);
    const [recPct, setRecPct]   = useState(0);

    const totalMs = scenes.reduce((s, sc) => s + sc.duration, 0);

    // Pre-load all scene images whenever scenes change
    useEffect(() => {
      imagesRef.current.clear();
      scenes.forEach(sc => {
        if (sc.imageUrl && !imagesRef.current.has(sc.imageUrl)) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => imagesRef.current.set(sc.imageUrl!, img);
          img.onerror = () => {}; // ignore broken URLs
          img.src = sc.imageUrl;
        }
      });
    }, [scenes]);

    /** Resolve which scene is active at a given elapsed-ms position */
    const resolveScene = useCallback((elapsedMs: number) => {
      let acc = 0;
      for (const sc of scenes) {
        if (elapsedMs < acc + sc.duration) {
          return { scene: sc, sceneStart: acc };
        }
        acc += sc.duration;
      }
      return { scene: scenes[scenes.length - 1], sceneStart: totalMs - scenes[scenes.length - 1].duration };
    }, [scenes, totalMs]);

    // ── Preview animation loop ──────────────────────────────────────────────
    const previewLoop = useCallback((ts: number) => {
      const cv = canvasRef.current;
      const ctx = cv?.getContext("2d");
      if (!cv || !ctx) return;

      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) % totalMs;
      const overall = elapsed / totalMs;
      const { scene, sceneStart } = resolveScene(elapsed);
      const sp = (elapsed - sceneStart) / scene.duration;

      drawFrame(ctx, scene, template, sp, overall, imagesRef.current);
      rafRef.current = requestAnimationFrame(previewLoop);
    }, [resolveScene, template, totalMs]);

    useEffect(() => {
      startRef.current = 0;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(previewLoop);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [previewLoop]);

    // ── Exposed imperative API ──────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      getThumbnail: () => canvasRef.current?.toDataURL("image/jpeg", 0.82) ?? "",

      stopRecording: () => {
        recRef.current?.stop();
        setIsRec(false);
      },

      startRecording: () => {
        const cv = canvasRef.current;
        if (!cv) return;

        // Stop preview loop
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        chunksRef.current = [];

        // Prefer high-quality WebM vp9; fall back to vp8, then mp4
        const mimeType = (
          MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" :
          MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4"
        );

        const stream   = cv.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3_000_000 });
        recRef.current = recorder;

        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const thumb = cv.toDataURL("image/jpeg", 0.82);
          onRecordComplete?.(blob, thumb);
          setIsRec(false);
          setRecPct(0);
          // Resume preview after recording
          startRef.current = 0;
          rafRef.current = requestAnimationFrame(previewLoop);
        };

        // Recording animation — goes through scenes once from the start
        let recStart = 0;
        const recLoop = (ts: number) => {
          if (!recStart) recStart = ts;
          const elapsed = ts - recStart;
          const progress = Math.min(1, elapsed / totalMs);
          setRecPct(progress);
          onProgress?.(progress);

          const ctx = cv.getContext("2d");
          if (ctx) {
            const { scene, sceneStart } = resolveScene(Math.min(elapsed, totalMs - 1));
            const sp = Math.min((elapsed - sceneStart) / scene.duration, 0.99);
            drawFrame(ctx, scene, template, sp, progress, imagesRef.current);
          }

          if (elapsed < totalMs) {
            rafRef.current = requestAnimationFrame(recLoop);
          } else {
            recorder.stop();
          }
        };

        setIsRec(true);
        recorder.start(100); // collect data every 100 ms
        rafRef.current = requestAnimationFrame(recLoop);
      },
    }), [resolveScene, template, totalMs, onRecordComplete, onProgress, previewLoop]);

    const displayH = Math.round(displayWidth * (CH / CW));

    return (
      <div className="flex flex-col items-center gap-3">
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className="rounded-2xl shadow-2xl ring-2 ring-white/10"
          style={{ width: displayWidth, height: displayH }}
        />
        {isRec && (
          <div style={{ width: displayWidth }} className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Recording…
              </span>
              <span>{Math.round(recPct * 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-100"
                style={{ width: `${recPct * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);

ReelRenderer.displayName = "ReelRenderer";
export default ReelRenderer;
