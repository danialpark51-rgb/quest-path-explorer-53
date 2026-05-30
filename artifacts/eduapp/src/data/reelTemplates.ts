// ─── Reel Templates ───────────────────────────────────────────────────────────
// Each template defines the full visual identity of a reel:
// colors, transitions, typography, timing, and default hashtags.

export type ReelTemplate = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gradient: [string, string];   // CSS hex colors for background gradient
  accent: string;               // Accent / highlight color
  textColor: string;            // Main title color
  subtextColor: string;         // Subtitle / body color
  overlayOpacity: number;       // Dark overlay on images (0–1)
  transition: "fade" | "slide-up" | "zoom" | "bounce";
  layout: "centered" | "bottom-third" | "top-heavy";
  titleSize: number;            // Font size (px) on 540-wide canvas
  subtitleSize: number;
  captionBg: string;            // Caption pill background
  captionText: string;
  sceneHoldMs: number;          // How long each scene stays (ms)
  transitionMs: number;         // Transition animation duration (ms)
  hashtags: string[];
};

export type MusicTrack = {
  id: string;
  name: string;
  artist: string;
  duration: string;
  genre: string;
  emoji: string;
  audioUrl?: string; // free Mixkit CDN preview URL for playback
};

export type ReelScene = {
  id: string;
  text: string;
  subtext?: string;
  caption?: string;
  imageUrl?: string;
  duration: number; // ms
};

export type ContentType = "achievement" | "project" | "quiz" | "notes" | "photo" | "school";

// ─── 12 Modular Templates (6 original + 6 new styles) ────────────────────────

export const REEL_TEMPLATES: ReelTemplate[] = [
  // ── Original 6 ──────────────────────────────────────────────────────────────
  {
    id: "study-motivation",
    name: "Study Motivation",
    emoji: "📚",
    description: "Deep purple gradient for inspiring study moments",
    gradient: ["#6C3483", "#1A5276"],
    accent: "#F7DC6F",
    textColor: "#FFFFFF",
    subtextColor: "#D2B4DE",
    overlayOpacity: 0.3,
    transition: "fade",
    layout: "centered",
    titleSize: 44,
    subtitleSize: 22,
    captionBg: "#6C3483",
    captionText: "#FFFFFF",
    sceneHoldMs: 3200,
    transitionMs: 600,
    hashtags: ["#StudyMotivation", "#EduPath", "#StudentLife", "#Learning"],
  },
  {
    id: "project-showcase",
    name: "Project Showcase",
    emoji: "🚀",
    description: "Deep teal for showing off your best work",
    gradient: ["#0B3D6B", "#145A8F"],
    accent: "#00D2FF",
    textColor: "#FFFFFF",
    subtextColor: "#AED6F1",
    overlayOpacity: 0.25,
    transition: "slide-up",
    layout: "bottom-third",
    titleSize: 42,
    subtitleSize: 21,
    captionBg: "#0B3D6B",
    captionText: "#00D2FF",
    sceneHoldMs: 3500,
    transitionMs: 500,
    hashtags: ["#ProjectShowcase", "#EduPath", "#Innovation", "#STEM"],
  },
  {
    id: "creative-skills",
    name: "Creative Skills",
    emoji: "🎨",
    description: "Bold orange-red for artistic talent reels",
    gradient: ["#C0392B", "#E67E22"],
    accent: "#F9CA24",
    textColor: "#FFFFFF",
    subtextColor: "#FDEBD0",
    overlayOpacity: 0.2,
    transition: "zoom",
    layout: "centered",
    titleSize: 46,
    subtitleSize: 23,
    captionBg: "#C0392B",
    captionText: "#FFFFFF",
    sceneHoldMs: 3000,
    transitionMs: 700,
    hashtags: ["#CreativeSkills", "#EduPath", "#ArtAndDesign", "#Talent"],
  },
  {
    id: "daily-routine",
    name: "Daily Routine",
    emoji: "⏰",
    description: "Warm amber tones for productivity highlights",
    gradient: ["#D35400", "#F39C12"],
    accent: "#FFFFFF",
    textColor: "#FFFFFF",
    subtextColor: "#FAD7A0",
    overlayOpacity: 0.25,
    transition: "slide-up",
    layout: "top-heavy",
    titleSize: 40,
    subtitleSize: 20,
    captionBg: "#D35400",
    captionText: "#FFFFFF",
    sceneHoldMs: 2800,
    transitionMs: 500,
    hashtags: ["#DailyRoutine", "#EduPath", "#Productivity", "#StudyLife"],
  },
  {
    id: "achievement-glowup",
    name: "Achievement Glow-Up",
    emoji: "🏆",
    description: "Golden celebration theme for major wins",
    gradient: ["#B7950B", "#F1C40F"],
    accent: "#1A1A2E",
    textColor: "#1A1A2E",
    subtextColor: "#5D4037",
    overlayOpacity: 0.15,
    transition: "bounce",
    layout: "centered",
    titleSize: 48,
    subtitleSize: 26,
    captionBg: "#1A1A2E",
    captionText: "#F1C40F",
    sceneHoldMs: 3000,
    transitionMs: 800,
    hashtags: ["#Achievement", "#EduPath", "#GlowUp", "#Winning"],
  },
  {
    id: "exam-results",
    name: "Exam Results",
    emoji: "📝",
    description: "Dark navy + red for dramatic score reveals",
    gradient: ["#1A1A2E", "#16213E"],
    accent: "#E94560",
    textColor: "#FFFFFF",
    subtextColor: "#A8A9AD",
    overlayOpacity: 0.1,
    transition: "fade",
    layout: "centered",
    titleSize: 52,
    subtitleSize: 28,
    captionBg: "#E94560",
    captionText: "#FFFFFF",
    sceneHoldMs: 3500,
    transitionMs: 600,
    hashtags: ["#ExamResults", "#EduPath", "#AcademicExcellence", "#Toppers"],
  },

  // ── 6 New Template Styles ────────────────────────────────────────────────────
  {
    id: "minimal",
    name: "Minimal",
    emoji: "⬜",
    description: "Clean white space, sharp typography, pure focus",
    gradient: ["#F8F9FA", "#E9ECEF"],
    accent: "#212529",
    textColor: "#212529",
    subtextColor: "#6C757D",
    overlayOpacity: 0.0,
    transition: "fade",
    layout: "centered",
    titleSize: 46,
    subtitleSize: 22,
    captionBg: "#212529",
    captionText: "#F8F9FA",
    sceneHoldMs: 3000,
    transitionMs: 500,
    hashtags: ["#Minimal", "#EduPath", "#CleanDesign", "#StudentLife"],
  },
  {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    description: "Electric neon on dark — high-energy glow effects",
    gradient: ["#0D0D0D", "#1A0A2E"],
    accent: "#00FFCC",
    textColor: "#00FFCC",
    subtextColor: "#FF00FF",
    overlayOpacity: 0.05,
    transition: "zoom",
    layout: "centered",
    titleSize: 46,
    subtitleSize: 22,
    captionBg: "#00FFCC22",
    captionText: "#00FFCC",
    sceneHoldMs: 2800,
    transitionMs: 600,
    hashtags: ["#Neon", "#EduPath", "#NightVibes", "#GlowUp"],
  },
  {
    id: "cinematic",
    name: "Cinematic",
    emoji: "🎬",
    description: "Widescreen drama — dark moody cinematic tones",
    gradient: ["#1C1C1C", "#2C3E50"],
    accent: "#E2B96F",
    textColor: "#F5F5F0",
    subtextColor: "#BDB9A8",
    overlayOpacity: 0.35,
    transition: "fade",
    layout: "bottom-third",
    titleSize: 44,
    subtitleSize: 20,
    captionBg: "#1C1C1CCC",
    captionText: "#E2B96F",
    sceneHoldMs: 3800,
    transitionMs: 900,
    hashtags: ["#Cinematic", "#EduPath", "#FilmStyle", "#StudentStory"],
  },
  {
    id: "gradient",
    name: "Gradient",
    emoji: "🌈",
    description: "Vivid sunset gradient — warm, vibrant, eye-catching",
    gradient: ["#F72585", "#7209B7"],
    accent: "#4CC9F0",
    textColor: "#FFFFFF",
    subtextColor: "#FFD6F0",
    overlayOpacity: 0.15,
    transition: "slide-up",
    layout: "centered",
    titleSize: 46,
    subtitleSize: 22,
    captionBg: "#7209B7AA",
    captionText: "#FFFFFF",
    sceneHoldMs: 3000,
    transitionMs: 600,
    hashtags: ["#Gradient", "#EduPath", "#ColorPop", "#VibeCheck"],
  },
  {
    id: "motion",
    name: "Motion",
    emoji: "💫",
    description: "Dynamic bounce + zoom — high-energy kinetic feel",
    gradient: ["#003973", "#E5E5BE"],
    accent: "#FF6B35",
    textColor: "#FFFFFF",
    subtextColor: "#E8E8C8",
    overlayOpacity: 0.2,
    transition: "bounce",
    layout: "top-heavy",
    titleSize: 50,
    subtitleSize: 24,
    captionBg: "#003973CC",
    captionText: "#FF6B35",
    sceneHoldMs: 2600,
    transitionMs: 700,
    hashtags: ["#Motion", "#EduPath", "#EnergyBoost", "#GoHard"],
  },
  {
    id: "black-and-gold",
    name: "Black & Gold",
    emoji: "✨",
    description: "Luxury black with gold accents — premium feel",
    gradient: ["#0A0A0A", "#1A1200"],
    accent: "#D4AF37",
    textColor: "#D4AF37",
    subtextColor: "#C9A84C",
    overlayOpacity: 0.05,
    transition: "fade",
    layout: "centered",
    titleSize: 48,
    subtitleSize: 22,
    captionBg: "#D4AF3722",
    captionText: "#D4AF37",
    sceneHoldMs: 3500,
    transitionMs: 800,
    hashtags: ["#BlackAndGold", "#EduPath", "#Premium", "#Winning"],
  },
];

// ─── Music Tracks — free Mixkit CDN previews (no attribution required) ──────
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "motivation", name: "Motivational Beat", artist: "SoundHelix", duration: "5:00",
    genre: "Electronic", emoji: "🔥",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "lofi", name: "Study Vibes", artist: "SoundHelix", duration: "5:00",
    genre: "Lo-Fi Chill", emoji: "📚",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
  {
    id: "celebration", name: "Achievement Unlocked", artist: "SoundHelix", duration: "5:00",
    genre: "Pop", emoji: "🏆",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "hustle", name: "Daily Hustle", artist: "SoundHelix", duration: "5:00",
    genre: "Hip Hop", emoji: "💪",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  },
  {
    id: "dream", name: "Dream Big", artist: "SoundHelix", duration: "5:00",
    genre: "Cinematic", emoji: "✨",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    id: "future", name: "Future Stars", artist: "SoundHelix", duration: "5:00",
    genre: "Ambient", emoji: "⭐",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
  },
];

// ─── Content Type Definitions ─────────────────────────────────────────────────
export const CONTENT_TYPES: { id: ContentType; label: string; emoji: string; placeholder: string }[] = [
  { id: "achievement", label: "Achievement",   emoji: "🏆", placeholder: "e.g. Won Science Olympiad 2025" },
  { id: "project",     label: "Project",       emoji: "🚀", placeholder: "e.g. Built an AI-powered app" },
  { id: "quiz",        label: "Quiz Result",   emoji: "📝", placeholder: "e.g. Scored 98/100 in Physics" },
  { id: "notes",       label: "My Notes",      emoji: "📚", placeholder: "e.g. Today I mastered calculus" },
  { id: "photo",       label: "Photo Moment",  emoji: "📸", placeholder: "e.g. Lab day at school!" },
  { id: "school",      label: "School Moment", emoji: "🎓", placeholder: "e.g. Graduation day 2025!" },
];

// ─── AI Viral Trend Detector (Mock) ──────────────────────────────────────────
// TODO: Replace with a real trending API (TikTok API, Twitter/X Trends, etc.)
// This mock function returns contextually relevant hashtags based on goal and content.
export function getTrendingHashtags(goal: string, contentType: ContentType): string[] {
  const base = ["#EduPath", "#StudentLife", "#Learning2025", "#IndiaStudents", "#SchoolLife"];
  const goalMap: Record<string, string[]> = {
    Engineering: ["#JEE2025", "#EngineeringStudent", "#IIT", "#STEM", "#CodeLife"],
    Medical:     ["#NEET2025", "#MedStudent", "#Doctor", "#BiologyRocks", "#MBBS"],
    Commerce:    ["#CA2025", "#CommerceStudent", "#Finance", "#Entrepreneur", "#Business"],
    Arts:        ["#ArtsStudent", "#Creative", "#Design", "#NID", "#ArtLife"],
    IT:          ["#CodeLife", "#TechStudent", "#Programming", "#WebDev", "#Python"],
    Defence:     ["#NDA2025", "#DefenceStudent", "#ArmyLife", "#Patriot", "#Soldier"],
    Govt:        ["#GovtExam", "#UPSC2025", "#SSC", "#PublicService", "#IAS"],
  };
  const typeMap: Record<ContentType, string[]> = {
    achievement: ["#Achievement", "#Proud", "#Winner", "#Champion"],
    project:     ["#ProjectShowcase", "#Innovation", "#Build", "#MakerLife"],
    quiz:        ["#QuizTime", "#TopScorer", "#AceIt", "#StudyWins"],
    notes:       ["#StudyNotes", "#StudyGram", "#Notes", "#Revision"],
    photo:       ["#SchoolLife", "#Memories", "#BehindTheScenes", "#StudyGram"],
    school:      ["#SchoolMoments", "#StudentLife", "#Memories", "#CampusLife"],
  };
  const combined = [
    ...base,
    ...(goalMap[goal] ?? ["#StudyMotivation", "#Goals"]),
    ...(typeMap[contentType] ?? []),
  ];
  // Return unique, max 12
  return [...new Set(combined)].slice(0, 12);
}

// ─── Default scene builder (no AI needed) ────────────────────────────────────
// Builds sensible default scenes from user-provided content.
// The AI endpoint can override these with more creative copy.
export function buildDefaultScenes(
  title: string,
  subtitle: string,
  contentType: ContentType,
  score: string,
  imageUrl: string,
  template: ReelTemplate,
): ReelScene[] {
  const hold = template.sceneHoldMs;
  const scenes: ReelScene[] = [];

  // Scene 1 – Hook / Intro
  scenes.push({
    id: "s1",
    text: title || "My Achievement",
    subtext: subtitle || CONTENT_TYPES.find(c => c.id === contentType)?.label,
    imageUrl: imageUrl || undefined,
    caption: contentType === "quiz" && score ? `Score: ${score}` : undefined,
    duration: hold,
  });

  // Scene 2 – Detail / Score
  if (score) {
    scenes.push({
      id: "s2",
      text: score,
      subtext: "🎯 Score Achieved",
      caption: "Hard work pays off!",
      duration: hold * 0.85,
    });
  } else {
    scenes.push({
      id: "s2",
      text: subtitle || "Pushing Limits Every Day",
      subtext: "📈 Growth Mindset",
      caption: "Keep going!",
      duration: hold * 0.85,
    });
  }

  // Scene 3 – CTA / Outro
  scenes.push({
    id: "s3",
    text: "Keep Learning!",
    subtext: "🚀 EduPath Student",
    caption: "#EduPath #StudentLife",
    duration: hold * 0.7,
  });

  return scenes;
}
