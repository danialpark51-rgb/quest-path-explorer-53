/**
 * Skill Reels AI Studio — Multi-step wizard
 *
 * Step 0 – Content  : What are you showcasing?
 * Step 1 – Template : Choose your visual style
 * Step 2 – Music    : Pick a soundtrack
 * Step 3 – Preview  : Canvas preview + record canvas OR generate with fal.ai AI Video
 * Step 4 – Share    : Published! Share everywhere
 *
 * Remix mode: visit /reels/studio?remixFrom={reelId}&template={tplId}&remixUsername={user}
 * to pre-populate the template and show a "Remixing from @user" banner.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Sparkles, Check, Download,
  Share2, Loader2, Music, Palette, Film, Upload,
  Play, RefreshCw, Trophy, Wand2, RefreshCcw,
  ExternalLink, Video, ImagePlus, X as XIcon, CloudUpload,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import BottomNav from "@/components/BottomNav";
import ReelRenderer, { type ReelRendererHandle } from "@/components/ReelRenderer";
import {
  REEL_TEMPLATES, MUSIC_TRACKS, CONTENT_TYPES,
  buildDefaultScenes, getTrendingHashtags,
  type ReelTemplate, type MusicTrack, type ContentType, type ReelScene,
} from "@/data/reelTemplates";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentForm = {
  title: string;
  subtitle: string;
  contentType: ContentType;
  score: string;
  imageUrl: string;
};

type PikaState = "idle" | "starting" | "polling" | "done" | "failed";

const STEP_LABELS = ["Content", "Template", "Music", "Preview", "Share"];
const STEP_ICONS  = [Upload, Palette, Music, Film, Share2];

const EMPTY_FORM: ContentForm = {
  title: "", subtitle: "", contentType: "achievement", score: "", imageUrl: "",
};

const API = (path: string, opts?: RequestInit) =>
  fetch(`/api${path}`, { headers: { "Content-Type": "application/json" }, ...opts });

/** Convert a Blob to a raw base64 string (no data: prefix). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReelsStudioPage() {
  const navigate              = useNavigate();
  const { user }              = useUser();
  const [searchParams]        = useSearchParams();

  // ── Remix URL params ───────────────────────────────────────────────────────
  const remixFromId   = searchParams.get("remixFrom")      ?? "";
  const remixUsername = searchParams.get("remixUsername")  ?? "";
  const remixTemplate = searchParams.get("template")       ?? "";

  // ── Wizard state ───────────────────────────────────────────────────────────
  const [step,             setStep]             = useState(0);
  const [form,             setForm]             = useState<ContentForm>(EMPTY_FORM);
  const [selectedTemplate, setSelectedTemplate] = useState<ReelTemplate>(() => {
    if (remixTemplate) return REEL_TEMPLATES.find(t => t.id === remixTemplate) ?? REEL_TEMPLATES[0];
    return REEL_TEMPLATES[0];
  });
  const [selectedMusic,    setSelectedMusic]    = useState<MusicTrack>(MUSIC_TRACKS[0]);
  const [scenes,           setScenes]           = useState<ReelScene[]>(() =>
    buildDefaultScenes("", "", "achievement", "", "", REEL_TEMPLATES[0]),
  );

  // ── Canvas recording ───────────────────────────────────────────────────────
  const [generatedBlob,  setGeneratedBlob]  = useState<Blob | null>(null);
  const [thumbnailData,  setThumbnailData]  = useState("");
  const [recProgress,    setRecProgress]    = useState(0);
  const rendererRef = useRef<ReelRendererHandle>(null);

  // ── Pika AI video generation ───────────────────────────────────────────────
  const [pikaState,      setPikaState]      = useState<PikaState>("idle");
  const [pikaJobId,      setPikaJobId]      = useState("");
  const [pikaProvider,   setPikaProvider]   = useState("");
  const [pikaVideoUrl,   setPikaVideoUrl]   = useState("");
  const [pikaProgress,   setPikaProgress]   = useState(0);
  const [pikaEta,        setPikaEta]        = useState(0); // seconds remaining estimate
  const pikaPollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pikaStartRef  = useRef<number>(0);

  // ── Custom media (image attachment + audio upload) ─────────────────────────
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl,  setCustomAudioUrl]  = useState("");   // object URL for playback
  const [customAudioName, setCustomAudioName] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Canvas video upload (so it can play back in the feed) ──────────────────
  const [canvasVideoUrl,  setCanvasVideoUrl]  = useState("");
  const [isUploading,     setIsUploading]     = useState(false);

  // ── General UI ─────────────────────────────────────────────────────────────
  const [isAiLoading,    setIsAiLoading]    = useState(false);
  const [isPublishing,   setIsPublishing]   = useState(false);
  const [error,          setError]          = useState("");

  // ── Scenes / template rebuild ──────────────────────────────────────────────
  const rebuildScenes = useCallback((f: ContentForm, tpl: ReelTemplate) => {
    setScenes(buildDefaultScenes(f.title, f.subtitle, f.contentType, f.score, f.imageUrl, tpl));
  }, []);

  const handleFormChange = (patch: Partial<ContentForm>) => {
    const next = { ...form, ...patch };
    setForm(next);
    rebuildScenes(next, selectedTemplate);
  };

  const handleTemplateSelect = (tpl: ReelTemplate) => {
    setSelectedTemplate(tpl);
    rebuildScenes(form, tpl);
  };

  // ── Pika polling effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (pikaState !== "polling" || !pikaJobId) return;

    pikaStartRef.current = Date.now();
    const MAX_WAIT_MS = 3 * 60 * 1000; // 3 min max

    const poll = async () => {
      try {
        const res  = await API(`/reels/pika-status/${pikaJobId}?provider=${encodeURIComponent(pikaProvider)}`);
        const data = await res.json() as { status: string; videoUrl?: string };

        // Update simulated progress (grows to 90% while waiting)
        const elapsed = Date.now() - pikaStartRef.current;
        const simPct  = Math.min(90, Math.round((elapsed / 80_000) * 90));
        setPikaProgress(simPct);
        setPikaEta(Math.max(0, Math.round((80_000 - elapsed) / 1000)));

        if (data.status === "finished" && data.videoUrl) {
          setPikaVideoUrl(data.videoUrl);
          setPikaState("done");
          setPikaProgress(100);
          clearInterval(pikaPollerRef.current!);
          pikaPollerRef.current = null;
        } else if (data.status === "failed") {
          setPikaState("failed");
          clearInterval(pikaPollerRef.current!);
          pikaPollerRef.current = null;
          setError("AI video generation failed. You can still use the canvas recording below.");
        }

        // Timeout guard
        if (elapsed > MAX_WAIT_MS) {
          setPikaState("failed");
          clearInterval(pikaPollerRef.current!);
          pikaPollerRef.current = null;
          setError("AI video generation timed out. Try again or use canvas recording.");
        }
      } catch { /* network hiccup — keep polling */ }
    };

    pikaPollerRef.current = setInterval(poll, 4000);
    poll(); // immediate first check
    return () => {
      if (pikaPollerRef.current) clearInterval(pikaPollerRef.current);
    };
  }, [pikaState, pikaJobId, pikaProvider]);

  // ── OpenAI scene generation ────────────────────────────────────────────────
  const generateWithAI = async () => {
    if (!form.title.trim()) { setError("Please enter a title first."); return; }
    setError("");
    setIsAiLoading(true);
    try {
      const res  = await API("/reels/generate", {
        method: "POST",
        body: JSON.stringify({
          title: form.title, subtitle: form.subtitle,
          contentType: form.contentType, score: form.score,
          goal: user?.selectedGoal ?? "",
        }),
      });
      const data = await res.json() as { scenes?: ReelScene[]; error?: string };
      if (!res.ok || !data.scenes) throw new Error(data.error ?? "AI generation failed");
      setScenes(data.scenes);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ── Pika AI video generation ───────────────────────────────────────────────
  const generateWithPika = async () => {
    if (scenes.length === 0) { setError("Complete content setup in Step 1 first."); return; }
    setError("");
    setPikaState("starting");
    setPikaProgress(5);
    setPikaVideoUrl("");

    try {
      const res  = await API("/reels/pika-generate", {
        method: "POST",
        body: JSON.stringify({
          title:          form.title || "Student Achievement",
          scenes:         scenes.slice(0, 3),
          templateName:   selectedTemplate.name,
          gradientColors: selectedTemplate.gradient,
        }),
      });
      const data = await res.json() as { jobId?: string; provider?: string; error?: string };
      if (!res.ok || !data.jobId) throw new Error(data.error ?? "Failed to start AI video generation");

      setPikaJobId(data.jobId);
      setPikaProvider(data.provider ?? "fal-ai/kling-video/v1/standard/text-to-video");
      setPikaState("polling");
      setPikaProgress(12);
    } catch (e) {
      setPikaState("failed");
      setPikaProgress(0);
      setError((e as Error).message);
    }
  };

  // ── Image file attachment ──────────────────────────────────────────────────
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      handleFormChange({ imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Custom audio upload ────────────────────────────────────────────────────
  const handleCustomAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    const url = URL.createObjectURL(file);
    setCustomAudioFile(file);
    setCustomAudioUrl(url);
    setCustomAudioName(file.name.length > 30 ? file.name.slice(0, 27) + "…" : file.name);
    const customTrack: MusicTrack = {
      id: "custom", name: file.name.replace(/\.[^.]+$/, "").slice(0, 40),
      artist: "Your upload", duration: "–", genre: "Custom", emoji: "🎵",
    };
    setSelectedMusic(customTrack);
    e.target.value = "";
  };

  // ── Play / stop custom audio preview ──────────────────────────────────────
  const playCustomAudio = () => {
    if (!customAudioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(customAudioUrl);
      audioRef.current.loop = true;
    }
    audioRef.current.src = customAudioUrl;
    audioRef.current.play().catch(() => {});
  };
  const stopCustomAudio = () => { audioRef.current?.pause(); };

  // ── Canvas recording callbacks ─────────────────────────────────────────────
  const handleRecordComplete = async (blob: Blob, thumb: string) => {
    setGeneratedBlob(blob);
    setThumbnailData(thumb);
    // Auto-upload canvas video so it can play back in the feed
    setIsUploading(true);
    setCanvasVideoUrl("");
    try {
      const base64 = await blobToBase64(blob);
      const res = await fetch("/api/reels/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoData: base64, mimeType: blob.type }),
      });
      const data = await res.json() as { videoUrl?: string; error?: string };
      if (data.videoUrl) {
        setCanvasVideoUrl(data.videoUrl);
      }
    } catch {
      // Upload failed — canvas download still works, just can't play in feed
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (blobOverride?: Blob) => {
    const src = blobOverride ?? generatedBlob;
    if (!src) return;
    const url = URL.createObjectURL(src);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `edupath-reel-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!user) return;
    setIsPublishing(true);
    setError("");
    try {
      const hashtags = getTrendingHashtags(user.selectedGoal ?? "", form.contentType).join(",");
      const res  = await API("/reels", {
        method: "POST",
        body: JSON.stringify({
          username:        user.username,
          fullName:        user.fullName,
          title:           form.title || "My Reel",
          templateId:      selectedTemplate.id,
          scenesJson:      JSON.stringify(scenes),
          thumbnailData:   thumbnailData || rendererRef.current?.getThumbnail() || "",
          hashtags,
          musicTrack:      selectedMusic.id === "custom" ? `custom:${customAudioName}` : selectedMusic.id,
          goal:            user.selectedGoal ?? "",
          contentType:     form.contentType,
          videoUrl:        pikaVideoUrl || canvasVideoUrl || null,
          remixedFrom:     remixFromId    || null,
          remixedFromUser: remixUsername  || null,
        }),
      });
      const data = await res.json() as { reelId?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to publish");
      setStep(4);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Step navigation ────────────────────────────────────────────────────────
  const canProceedStep0 = form.title.trim().length > 0;
  const canPublish      = generatedBlob !== null || pikaVideoUrl !== "" || canvasVideoUrl !== "";

  const goNext = () => {
    if (step === 3 && !canPublish) {
      setError("Record the canvas reel or generate an AI video first.");
      return;
    }
    if (step === 3) { handlePublish(); return; }
    setError("");
    setStep(s => Math.min(s + 1, 4));
  };
  const goPrev = () => { setError(""); setStep(s => Math.max(s - 1, 0)); };

  const resetAll = () => {
    setStep(0); setForm(EMPTY_FORM);
    setGeneratedBlob(null); setThumbnailData(""); setCanvasVideoUrl("");
    setPikaState("idle"); setPikaJobId(""); setPikaVideoUrl(""); setPikaProgress(0);
    stopCustomAudio();
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    setCustomAudioFile(null); setCustomAudioUrl(""); setCustomAudioName("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/reels")} className="p-1.5 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-base text-foreground">
            {remixFromId ? "Remix Studio" : "Skill Reels Studio"}
          </h1>
          <p className="text-xs text-muted-foreground">AI-powered reel creator</p>
        </div>
        <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
          ✨ AI
        </span>
      </div>

      {/* ── Remix banner ───────────────────────────────────────────────────── */}
      {remixFromId && (
        <div className="mx-4 mt-3 px-3 py-2.5 bg-primary/8 border border-primary/20 rounded-xl flex items-center gap-2 text-sm">
          <RefreshCcw className="w-4 h-4 text-primary shrink-0" />
          <span className="text-foreground">
            Remixing from{" "}
            <span className="font-bold text-primary">@{remixUsername}</span>
            {" "}— add your own content!
          </span>
        </div>
      )}

      {/* ── Step progress bar ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5">
          {STEP_LABELS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            const active = i === step, done = i < step;
            return (
              <div key={i} className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  done ? "bg-primary text-white" :
                  active ? "bg-primary/20 text-primary ring-2 ring-primary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-0.5 flex-1 rounded transition-all ${i < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 text-xs font-medium text-muted-foreground text-center">
          Step {step + 1} — {STEP_LABELS[step]}
        </div>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mb-3 px-3 py-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-2">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-destructive/60 hover:text-destructive text-xs">✕</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="px-4 space-y-4"
        >

          {/* ── STEP 0: Content ─────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              <SCard title="What are you showcasing?" emoji="🎬">
                <div className="grid grid-cols-3 gap-2">
                  {CONTENT_TYPES.map(ct => (
                    <button key={ct.id} onClick={() => handleFormChange({ contentType: ct.id })}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        form.contentType === ct.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}>
                      <span className="text-xl">{ct.emoji}</span>
                      <span className="text-xs">{ct.label}</span>
                    </button>
                  ))}
                </div>
              </SCard>

              <SCard title="Reel Details" emoji="📝">
                <div className="space-y-3">
                  <InputField
                    label="Title" required
                    value={form.title} maxLength={80}
                    placeholder={CONTENT_TYPES.find(c => c.id === form.contentType)?.placeholder}
                    onChange={v => handleFormChange({ title: v })}
                  />
                  <InputField
                    label="Subtitle"
                    value={form.subtitle} maxLength={60}
                    placeholder="e.g. Class 10, CBSE Board 2025"
                    onChange={v => handleFormChange({ subtitle: v })}
                  />
                  {(form.contentType === "quiz" || form.contentType === "achievement") && (
                    <InputField
                      label={form.contentType === "quiz" ? "Score / Marks" : "Achievement Detail"}
                      value={form.score} maxLength={40}
                      placeholder={form.contentType === "quiz" ? "e.g. 98/100" : "e.g. 1st Place"}
                      onChange={v => handleFormChange({ score: v })}
                    />
                  )}
                  {/* Image / video attachment from gallery or files */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Photo / Video (optional)
                    </label>
                    {form.imageUrl ? (
                      <div className="relative">
                        <img
                          src={form.imageUrl}
                          alt="preview"
                          className="w-full max-h-36 object-cover rounded-xl border border-border"
                        />
                        <button
                          onClick={() => handleFormChange({ imageUrl: "" })}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
                        >
                          <XIcon className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Attach from gallery or files</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleImageFile}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </SCard>

              {/* AI scene generator */}
              <button onClick={generateWithAI} disabled={isAiLoading || !form.title.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm shadow-lg disabled:opacity-50 active:scale-95 transition-transform">
                {isAiLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating scenes…</>
                  : <><Sparkles className="w-4 h-4" /> Generate Scenes with AI</>}
              </button>
              {scenes.length > 0 && form.title && (
                <p className="text-center text-xs text-primary font-medium">
                  ✅ {scenes.length} scenes ready — pick a template next
                </p>
              )}
            </div>
          )}

          {/* ── STEP 1: Template ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Choose your reel's visual style</p>
              <div className="grid grid-cols-2 gap-3">
                {REEL_TEMPLATES.map(tpl => (
                  <button key={tpl.id} onClick={() => handleTemplateSelect(tpl)}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                      selectedTemplate.id === tpl.id
                        ? "border-primary ring-2 ring-primary/40 scale-[0.98]"
                        : "border-border hover:border-primary/40"
                    }`}>
                    <div className="h-28 w-full flex flex-col items-center justify-center gap-1"
                      style={{ background: `linear-gradient(135deg, ${tpl.gradient[0]}, ${tpl.gradient[1]})` }}>
                      <span className="text-3xl">{tpl.emoji}</span>
                      <span className="text-white font-bold text-xs drop-shadow-md">{tpl.name}</span>
                      <span className="text-white/70 text-[10px] px-2 text-center leading-tight">{tpl.description}</span>
                    </div>
                    <div className="bg-card px-2 py-1.5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground capitalize">{tpl.transition}</span>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-md">{tpl.layout}</span>
                    </div>
                    {selectedTemplate.id === tpl.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Music ────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Pick a soundtrack or upload your own
              </p>

              {/* ── Custom audio upload ─────────────────────────────────── */}
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedMusic.id === "custom"
                  ? "border-primary bg-primary/8"
                  : "border-dashed border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
              }`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-400/10 flex items-center justify-center text-2xl shrink-0">
                  🎵
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">
                    {customAudioName || "Upload Your Music"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {customAudioName ? "Your upload · tap to change" : "MP3, WAV, OGG, M4A — any audio file"}
                  </div>
                </div>
                {customAudioName && selectedMusic.id === "custom" ? (
                  <div className="flex gap-1.5 shrink-0">
                    <button type="button"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); playCustomAudio(); }}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button type="button"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); stopCustomAudio(); }}
                      className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <CloudUpload className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <input type="file" accept="audio/*" className="hidden" onChange={handleCustomAudio} />
              </label>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
                <p className="relative text-center text-xs text-muted-foreground bg-background px-2 w-fit mx-auto">
                  or choose a preset
                </p>
              </div>

              {/* ── Preset tracks ───────────────────────────────────────── */}
              {MUSIC_TRACKS.map(track => (
                <button key={track.id} onClick={() => { setSelectedMusic(track); stopCustomAudio(); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedMusic.id === track.id
                      ? "border-primary bg-primary/8"
                      : "border-border bg-card hover:border-primary/40"
                  }`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl shrink-0">
                    {track.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{track.name}</div>
                    <div className="text-xs text-muted-foreground">{track.artist} · {track.genre}</div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">{track.duration}</div>
                  </div>
                  {selectedMusic.id === track.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── STEP 3: Preview & Generate ───────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Record your reel <strong>or</strong> generate a real video with fal.ai
              </p>

              {/* Canvas live preview */}
              <div className="flex justify-center">
                <ReelRenderer
                  ref={rendererRef}
                  scenes={scenes}
                  template={selectedTemplate}
                  onRecordComplete={handleRecordComplete}
                  onProgress={setRecProgress}
                  displayWidth={250}
                />
              </div>

              {/* Scene summary */}
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Scenes ({scenes.length})
                </p>
                {scenes.map((sc, i) => (
                  <div key={sc.id} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{sc.text}</p>
                      {sc.subtext && <p className="text-xs text-muted-foreground truncate">{sc.subtext}</p>}
                      <p className="text-xs text-muted-foreground/60">{(sc.duration / 1000).toFixed(1)}s</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Option A: Canvas recording ──────────────────────────── */}
              <div className="border border-border rounded-2xl p-3 space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Option A — Record Canvas Animation
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => rendererRef.current?.startRecording()}
                    disabled={!!generatedBlob || isUploading}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform">
                    <Play className="w-4 h-4" /> Record
                  </button>
                  <button onClick={() => { setGeneratedBlob(null); setThumbnailData(""); setRecProgress(0); setCanvasVideoUrl(""); }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground font-semibold text-sm active:scale-95 transition-transform">
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                </div>

                {/* Upload progress */}
                {isUploading && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    Uploading video for feed playback…
                  </div>
                )}

                {generatedBlob && !isUploading && (
                  <div className="space-y-2">
                    {/* Upload status */}
                    {canvasVideoUrl ? (
                      <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-medium">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        Canvas reel ready · playable in feed · {(generatedBlob.size / 1024).toFixed(0)} KB
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-medium">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        Canvas reel recorded · {(generatedBlob.size / 1024).toFixed(0)} KB (download only)
                      </div>
                    )}

                    {/* In-studio preview player */}
                    {canvasVideoUrl && (
                      <video
                        src={canvasVideoUrl}
                        controls playsInline
                        className="w-full rounded-xl max-h-48 bg-black object-contain"
                      />
                    )}

                    <button onClick={() => handleDownload()}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 active:scale-95 transition-all">
                      <Download className="w-3.5 h-3.5" /> Download .webm
                    </button>
                  </div>
                )}
              </div>

              {/* ── Option B: fal.ai video generation ──────────────────── */}
              <div className="rounded-2xl overflow-hidden border border-violet-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Wand2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">Option B — AI Video Generation</p>
                    <p className="text-xs text-white/75">Generates a real MP4 video with fal.ai</p>
                  </div>
                  {pikaState === "done" && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-3 bg-violet-50/50">
                  {/* IDLE */}
                  {pikaState === "idle" && (
                    <button onClick={generateWithPika}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
                      <Wand2 className="w-4 h-4" /> Generate AI Video
                    </button>
                  )}

                  {/* STARTING */}
                  {pikaState === "starting" && (
                    <div className="flex items-center gap-2 text-violet-700 text-sm font-medium py-1">
                      <Loader2 className="w-4 h-4 animate-spin" /> Connecting to fal.ai…
                    </div>
                  )}

                  {/* POLLING */}
                  {pikaState === "polling" && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-medium text-violet-700">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          AI is generating your video…
                        </span>
                        <span>{pikaEta > 0 ? `~${pikaEta}s` : "Almost done…"}</span>
                      </div>
                      <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700"
                          style={{ width: `${pikaProgress}%` }} />
                      </div>
                      <p className="text-[11px] text-violet-500 text-center">
                        Typically takes 30–90 seconds. Canvas option is still available.
                      </p>
                    </div>
                  )}

                  {/* DONE */}
                  {pikaState === "done" && pikaVideoUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                        <Check className="w-4 h-4" /> AI video generated! 🎉
                      </div>
                      <video
                        src={pikaVideoUrl}
                        controls playsInline
                        className="w-full rounded-xl max-h-56 bg-black object-contain"
                      />
                      <div className="flex items-center gap-2">
                        <a href={pikaVideoUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-violet-600 font-medium hover:underline">
                          <ExternalLink className="w-3.5 h-3.5" /> Open full video
                        </a>
                        <span className="text-muted-foreground/40">·</span>
                        <button onClick={() => setPikaState("idle")}
                          className="text-xs text-muted-foreground hover:text-foreground">
                          Regenerate
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FAILED */}
                  {pikaState === "failed" && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-600">Generation failed</p>
                      <button onClick={() => { setPikaState("idle"); setPikaProgress(0); setError(""); }}
                        className="flex items-center gap-1 text-xs text-violet-600 font-medium hover:underline">
                        <RefreshCcw className="w-3.5 h-3.5" /> Try again
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Publish readiness indicator */}
              {!canPublish && !isUploading && (
                <p className="text-center text-xs text-muted-foreground">
                  Complete Option A or B above to unlock "Publish to Feed"
                </p>
              )}
              {isUploading && (
                <p className="text-center text-xs text-blue-600 font-medium flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading canvas video…
                </p>
              )}
              {canPublish && (
                <p className="text-center text-xs text-primary font-semibold">
                  ✅ {pikaVideoUrl ? "AI video" : "Canvas recording"} ready — tap Publish!
                </p>
              )}

              <div className="text-xs text-muted-foreground/60 text-center">
                {selectedMusic.emoji} {selectedMusic.name} · {selectedMusic.genre}
              </div>
            </div>
          )}

          {/* ── STEP 4: Share ─────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5 py-4">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-5xl">🎉</div>
                <h2 className="text-xl font-bold text-foreground">
                  {remixFromId ? "Remix Published!" : "Reel Published!"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {remixFromId
                    ? `Your remix of @${remixUsername}'s reel is live!`
                    : "Your reel is live on EduPath. Share it everywhere!"}
                </p>
              </motion.div>

              {/* AI video if generated */}
              {pikaVideoUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Your AI Video
                  </p>
                  <video src={pikaVideoUrl} controls playsInline
                    className="w-full rounded-2xl max-h-64 bg-black object-contain shadow-lg" />
                </div>
              )}

              {/* Trending hashtags */}
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Trending Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {getTrendingHashtags(user?.selectedGoal ?? "", form.contentType).slice(0, 8).map(tag => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Share links */}
              <div className="space-y-2">
                {[
                  { label: "Share to Instagram", emoji: "📸", color: "from-pink-500 to-purple-600", hint: "Download & upload to Instagram Reels" },
                  { label: "Share to TikTok",    emoji: "🎵", color: "from-gray-800 to-gray-900",  hint: "Upload the video file to TikTok" },
                  { label: "Share to YouTube",   emoji: "▶️", color: "from-red-500 to-red-600",    hint: "Upload to YouTube Shorts" },
                ].map(s => (
                  <button key={s.label} onClick={() => handleDownload()}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r ${s.color} text-white font-semibold text-sm active:scale-95 transition-transform`}>
                    <span className="text-xl">{s.emoji}</span>
                    <div className="text-left">
                      <div>{s.label}</div>
                      <div className="text-xs opacity-70 font-normal">{s.hint}</div>
                    </div>
                    <Download className="w-4 h-4 ml-auto opacity-70" />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => navigate("/reels")}
                  className="py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm active:scale-95 transition-transform">
                  View Feed
                </button>
                <button onClick={resetAll}
                  className="py-3 rounded-xl bg-primary text-white font-semibold text-sm active:scale-95 transition-transform">
                  {remixFromId ? "New Remix" : "New Reel"}
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Bottom nav buttons ─────────────────────────────────────────────── */}
      {step < 4 && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2">
          <div className="max-w-xl mx-auto flex gap-3">
            {step > 0 && (
              <button onClick={goPrev}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm active:scale-95 transition-transform">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button onClick={goNext}
              disabled={(!canProceedStep0 && step === 0) || isPublishing}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-50 active:scale-95 transition-transform">
              {isPublishing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
              ) : step === 3 ? (
                <><Trophy className="w-4 h-4" /> Publish to Feed</>
              ) : (
                <>Next <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SCard({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, maxLength, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
