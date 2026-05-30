/**
 * Skill Reels Studio — Multi-step wizard
 *
 * Step 0 – Content   : What are you showcasing?
 * Step 1 – Template  : Choose your visual style (12 templates)
 * Step 2 – Music     : Upload from device OR pick a preset track
 * Step 3 – Preview   : Live canvas preview + final music tweak → publish directly (no recording needed)
 * Step 4 – Share     : Published! Share everywhere
 *
 * Publishing: canvas thumbnail is captured automatically; no video recording required.
 * Remix mode: /reels/studio?remixFrom={reelId}&template={tplId}&remixUsername={user}
 */

import { useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Sparkles, Check,
  Share2, Loader2, Music, Palette, Film, Upload,
  Play, Trophy, Wand2, RefreshCcw,
  ExternalLink, ImagePlus, X as XIcon, CloudUpload,
  StopCircle, Volume2,
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

const STEP_LABELS = ["Content", "Template", "Music", "Preview", "Share"];
const STEP_ICONS  = [Upload, Palette, Music, Film, Share2];

const EMPTY_FORM: ContentForm = {
  title: "", subtitle: "", contentType: "achievement", score: "", imageUrl: "",
};

const API = (path: string, opts?: RequestInit) =>
  fetch(`/api${path}`, { headers: { "Content-Type": "application/json" }, ...opts });

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
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack>(MUSIC_TRACKS[0]);
  const [scenes, setScenes] = useState<ReelScene[]>(() =>
    buildDefaultScenes("", "", "achievement", "", "", REEL_TEMPLATES[0]),
  );

  const rendererRef = useRef<ReelRendererHandle>(null);

  // ── Custom audio upload ────────────────────────────────────────────────────
  const [customAudioUrl,  setCustomAudioUrl]  = useState("");
  const [customAudioName, setCustomAudioName] = useState("");
  const [isPlaying,       setIsPlaying]       = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── General UI ─────────────────────────────────────────────────────────────
  const [isAiLoading,  setIsAiLoading]  = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error,        setError]        = useState("");

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

  // ── Image file attachment ──────────────────────────────────────────────────
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleFormChange({ imageUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Custom audio upload ────────────────────────────────────────────────────
  const handleCustomAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopAudio();
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    const url = URL.createObjectURL(file);
    setCustomAudioUrl(url);
    setCustomAudioName(file.name.length > 35 ? file.name.slice(0, 32) + "…" : file.name);
    setSelectedMusic({
      id: "custom",
      name: file.name.replace(/\.[^.]+$/, "").slice(0, 40),
      artist: "Your upload",
      duration: "–",
      genre: "Custom",
      emoji: "🎵",
    });
    e.target.value = "";
  };

  const playAudio = (url: string) => {
    if (!audioRef.current) audioRef.current = new Audio(url);
    audioRef.current.src = url;
    audioRef.current.loop = true;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlay = (url: string) => {
    if (isPlaying) { stopAudio(); } else { playAudio(url); }
  };

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!user) return;
    setIsPublishing(true);
    setError("");
    try {
      const hashtags = getTrendingHashtags(user.selectedGoal ?? "", form.contentType).join(",");
      // Capture canvas thumbnail automatically
      const thumbnailData = rendererRef.current?.getThumbnail() || "";
      const res = await API("/reels", {
        method: "POST",
        body: JSON.stringify({
          username:        user.username,
          fullName:        user.fullName,
          title:           form.title || "My Reel",
          templateId:      selectedTemplate.id,
          scenesJson:      JSON.stringify(scenes),
          thumbnailData,
          hashtags,
          musicTrack:      selectedMusic.id === "custom" ? `custom:${customAudioName}` : selectedMusic.id,
          goal:            user.selectedGoal ?? "",
          contentType:     form.contentType,
          videoUrl:        null,
          remixedFrom:     remixFromId    || null,
          remixedFromUser: remixUsername  || null,
        }),
      });
      const data = await res.json() as { reelId?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to publish");
      stopAudio();
      setStep(4);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Step navigation ────────────────────────────────────────────────────────
  const canProceed = form.title.trim().length > 0;

  const goNext = () => {
    if (step === 3) { handlePublish(); return; }
    setError("");
    setStep(s => Math.min(s + 1, 4));
  };
  const goPrev = () => { setError(""); setStep(s => Math.max(s - 1, 0)); };

  const resetAll = () => {
    setStep(0);
    setForm(EMPTY_FORM);
    stopAudio();
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    setCustomAudioUrl("");
    setCustomAudioName("");
    setSelectedMusic(MUSIC_TRACKS[0]);
  };

  const totalSec = (scenes.reduce((s, sc) => s + sc.duration, 0) / 1000).toFixed(1);

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
          <p className="text-xs text-muted-foreground">Template-powered reel creator</p>
        </div>
        <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
          🎬 Studio
        </span>
      </div>

      {/* ── Remix banner ───────────────────────────────────────────────────── */}
      {remixFromId && (
        <div className="mx-4 mt-3 px-3 py-2.5 bg-primary/8 border border-primary/20 rounded-xl flex items-center gap-2 text-sm">
          <RefreshCcw className="w-4 h-4 text-primary shrink-0" />
          <span className="text-foreground">
            Remixing from <span className="font-bold text-primary">@{remixUsername}</span> — add your own content!
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
                  done   ? "bg-primary text-white" :
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

          {/* ══════════════════════════════════════════════════════════════
              STEP 0 — Content
          ══════════════════════════════════════════════════════════════ */}
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
                  <InputField label="Title" required value={form.title} maxLength={80}
                    placeholder={CONTENT_TYPES.find(c => c.id === form.contentType)?.placeholder}
                    onChange={v => handleFormChange({ title: v })} />
                  <InputField label="Subtitle" value={form.subtitle} maxLength={60}
                    placeholder="e.g. Class 10, CBSE Board 2025"
                    onChange={v => handleFormChange({ subtitle: v })} />
                  {(form.contentType === "quiz" || form.contentType === "achievement") && (
                    <InputField
                      label={form.contentType === "quiz" ? "Score / Marks" : "Achievement Detail"}
                      value={form.score} maxLength={40}
                      placeholder={form.contentType === "quiz" ? "e.g. 98/100" : "e.g. 1st Place"}
                      onChange={v => handleFormChange({ score: v })} />
                  )}
                  {/* Image attachment */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Photo / Image (optional)
                    </label>
                    {form.imageUrl ? (
                      <div className="relative">
                        <img src={form.imageUrl} alt="preview"
                          className="w-full max-h-36 object-cover rounded-xl border border-border" />
                        <button onClick={() => handleFormChange({ imageUrl: "" })}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
                          <XIcon className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Attach from gallery or files</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
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

          {/* ══════════════════════════════════════════════════════════════
              STEP 1 — Template (12 styles)
          ══════════════════════════════════════════════════════════════ */}
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
                      <span className="font-bold text-xs drop-shadow-md" style={{ color: tpl.textColor }}>
                        {tpl.name}
                      </span>
                      <span className="text-[10px] px-2 text-center leading-tight opacity-75"
                        style={{ color: tpl.subtextColor }}>
                        {tpl.description}
                      </span>
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

          {/* ══════════════════════════════════════════════════════════════
              STEP 2 — Music: Upload from device OR pick preset
          ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Upload music from your device or pick a preset track
              </p>

              {/* ── Upload from device / folder ──────────────────────── */}
              <SCard title="Upload from Your Device" emoji="📁">
                <p className="text-xs text-muted-foreground">
                  Select any audio file from your phone, computer, or any folder — MP3, WAV, OGG, M4A, FLAC supported.
                </p>
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedMusic.id === "custom"
                    ? "border-primary bg-primary/8"
                    : "border-dashed border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
                }`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-400/10 flex items-center justify-center text-2xl shrink-0">
                    {selectedMusic.id === "custom" ? "🎵" : "📂"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      {customAudioName || "Browse Files / Folders"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {customAudioName
                        ? "Tap to replace · any audio file"
                        : "Tap to open file picker — choose from any folder"}
                    </p>
                  </div>
                  {customAudioName && selectedMusic.id === "custom" ? (
                    <div className="flex gap-1.5 shrink-0">
                      <button type="button"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); togglePlay(customAudioUrl); }}
                        className={`p-2 rounded-lg transition-colors ${
                          isPlaying
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}>
                        {isPlaying
                          ? <StopCircle className="w-4 h-4" />
                          : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <CloudUpload className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <input type="file" accept="audio/*" className="hidden" onChange={handleCustomAudio} />
                </label>
                {customAudioName && selectedMusic.id === "custom" && (
                  <div className="flex items-center gap-2 mt-1">
                    <Volume2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium truncate">{customAudioName}</span>
                    <button
                      onClick={() => {
                        stopAudio();
                        if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
                        setCustomAudioUrl("");
                        setCustomAudioName("");
                        setSelectedMusic(MUSIC_TRACKS[0]);
                      }}
                      className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </SCard>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground font-medium shrink-0">or pick a preset</span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* ── Preset tracks ─────────────────────────────────────── */}
              <div className="space-y-2">
                {MUSIC_TRACKS.map(track => (
                  <button key={track.id}
                    onClick={() => { stopAudio(); setCustomAudioUrl(""); setCustomAudioName(""); setSelectedMusic(track); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      selectedMusic.id === track.id
                        ? "border-primary bg-primary/8"
                        : "border-border bg-card hover:border-primary/40"
                    }`}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl shrink-0">
                      {track.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{track.name}</p>
                      <p className="text-xs text-muted-foreground">{track.artist} · {track.genre}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{track.duration}</p>
                    </div>
                    {selectedMusic.id === track.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 3 — Preview & Finalize (no recording required)
          ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Preview your reel — then publish it directly to the feed
              </p>

              {/* ── Live canvas preview ─────────────────────────────────── */}
              <div className="flex justify-center">
                <ReelRenderer
                  ref={rendererRef}
                  scenes={scenes}
                  template={selectedTemplate}
                  displayWidth={260}
                />
              </div>

              {/* ── Reel info summary ───────────────────────────────────── */}
              <div className="bg-muted/40 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reel Summary</p>
                  <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                    {totalSec}s · {scenes.length} scenes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${selectedTemplate.gradient[0]}, ${selectedTemplate.gradient[1]})` }} />
                  <span className="text-sm text-foreground font-medium">{selectedTemplate.name}</span>
                  <span className="text-xs text-muted-foreground">{selectedTemplate.emoji}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedMusic.emoji}</span>
                  <span className="text-sm text-foreground font-medium truncate">{selectedMusic.name}</span>
                  {selectedMusic.id === "custom" && customAudioName && (
                    <span className="text-xs text-primary font-medium shrink-0">Your upload</span>
                  )}
                </div>
              </div>

              {/* ── Scene list ──────────────────────────────────────────── */}
              <div className="space-y-2">
                {scenes.map((sc, i) => (
                  <div key={sc.id} className="flex items-start gap-2.5 bg-card border border-border rounded-xl px-3 py-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{sc.text}</p>
                      {sc.subtext && <p className="text-xs text-muted-foreground truncate">{sc.subtext}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground/60 shrink-0">{(sc.duration / 1000).toFixed(1)}s</span>
                  </div>
                ))}
              </div>

              {/* ── Quick music change ──────────────────────────────────── */}
              <SCard title="Change Music" emoji="🎵">
                <p className="text-xs text-muted-foreground mb-2">Upload a different track or switch preset</p>

                {/* Upload from device */}
                <label className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all mb-2 ${
                  selectedMusic.id === "custom"
                    ? "border-primary bg-primary/8"
                    : "border-dashed border-border hover:border-primary/40 hover:bg-primary/5"
                }`}>
                  <CloudUpload className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {customAudioName || "Upload from files / folder"}
                    </p>
                    <p className="text-xs text-muted-foreground">MP3, WAV, OGG, M4A — any folder on your device</p>
                  </div>
                  {customAudioName && selectedMusic.id === "custom" && (
                    <button type="button"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); togglePlay(customAudioUrl); }}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 shrink-0">
                      {isPlaying ? <StopCircle className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <input type="file" accept="audio/*" className="hidden" onChange={handleCustomAudio} />
                </label>

                {/* Quick preset grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  {MUSIC_TRACKS.map(track => (
                    <button key={track.id}
                      onClick={() => { stopAudio(); setSelectedMusic(track); setCustomAudioUrl(""); setCustomAudioName(""); }}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                        selectedMusic.id === track.id
                          ? "border-primary bg-primary/8"
                          : "border-border bg-card hover:border-primary/40"
                      }`}>
                      <span className="text-base">{track.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{track.name}</p>
                        <p className="text-[10px] text-muted-foreground">{track.genre}</p>
                      </div>
                      {selectedMusic.id === track.id && <Check className="w-3 h-3 text-primary ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </SCard>

              {/* Publish readiness */}
              <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2.5">
                <Wand2 className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Ready to publish!</p>
                  <p className="text-xs text-muted-foreground">Your reel thumbnail is captured automatically</p>
                </div>
                <Check className="w-4 h-4 text-primary shrink-0" />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 4 — Share
          ══════════════════════════════════════════════════════════════ */}
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
                    ? `Your remix of @${remixUsername}'s reel is live on EduPath!`
                    : "Your reel is live! Share it everywhere and get likes 🔥"}
                </p>
              </motion.div>

              {/* Reel details summary */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${selectedTemplate.gradient[0]}, ${selectedTemplate.gradient[1]})` }}>
                    <span className="text-2xl">{selectedTemplate.emoji}</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{form.title || "My Reel"}</p>
                    <p className="text-xs text-muted-foreground">{selectedTemplate.name} · {selectedMusic.name}</p>
                    <p className="text-xs text-muted-foreground">{totalSec}s · {scenes.length} scenes</p>
                  </div>
                </div>
              </div>

              {/* Trending hashtags */}
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Trending Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {getTrendingHashtags(user?.selectedGoal ?? "", form.contentType).slice(0, 8).map(tag => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share buttons */}
              <div className="space-y-2">
                {[
                  { label: "Share to Instagram", emoji: "📸", color: "from-pink-500 to-purple-600", hint: "Share screenshot · tag #EduPath" },
                  { label: "Share to TikTok",    emoji: "🎵", color: "from-gray-800 to-gray-900",  hint: "Share your achievement on TikTok" },
                  { label: "Share to YouTube",   emoji: "▶️", color: "from-red-500 to-red-600",    hint: "Upload to YouTube Shorts" },
                  { label: "Share via WhatsApp", emoji: "💬", color: "from-green-500 to-green-600", hint: "Share link with friends & family" },
                ].map(s => (
                  <button key={s.label}
                    onClick={() => {
                      const text = encodeURIComponent(
                        `🎓 ${form.title || "My Reel"} — Created with EduPath! #EduPath #StudentLife`
                      );
                      const url =
                        s.label.includes("WhatsApp")
                          ? `https://wa.me/?text=${text}`
                          : "#";
                      if (url !== "#") window.open(url, "_blank");
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r ${s.color} text-white font-semibold text-sm active:scale-95 transition-transform`}>
                    <span className="text-xl">{s.emoji}</span>
                    <div className="text-left">
                      <div>{s.label}</div>
                      <div className="text-xs opacity-70 font-normal">{s.hint}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
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

      {/* ── Bottom navigation buttons ──────────────────────────────────────── */}
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
              disabled={(!canProceed && step === 0) || isPublishing}
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

// ─── Helper components ────────────────────────────────────────────────────────

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
