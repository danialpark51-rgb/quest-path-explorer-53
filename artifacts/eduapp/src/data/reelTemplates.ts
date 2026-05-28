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

// ─── 6 Modular Templates ──────────────────────────────────────────────────────

export const REEL_TEMPLATES: ReelTemplate[] = [
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
];

// ─── Music Tracks (Placeholder library) ─────────────────────────────────────
// Plug real audio URLs here when music licensing is in place.
export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "motivation", name: "Motivational Beat",   artist: "EduPath Studio", duration: "0:30", genre: "Electronic",  emoji: "🔥" },
  { id: "lofi",       name: "Study Vibes",          artist: "EduPath Studio", duration: "0:45", genre: "Lo-Fi Chill", emoji: "📚" },
  { id: "celebration",name: "Achievement Unlocked", artist: "EduPath Studio", duration: "0:25", genre: "Pop",         emoji: "🏆" },
  { id: "hustle",     name: "Daily Hustle",          artist: "EduPath Studio", duration: "0:35", genre: "Hip Hop",     emoji: "💪" },
  { id: "dream",      name: "Dream Big",             artist: "EduPath Studio", duration: "0:40", genre: "Cinematic",   emoji: "✨" },
  { id: "future",     name: "Future Stars",          artist: "EduPath Studio", duration: "0:30", genre: "Ambient",     emoji: "⭐" },
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
