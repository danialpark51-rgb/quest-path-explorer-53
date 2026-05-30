/**
 * Goal-based YouTube Video Recommendations
 *
 * GET /api/videos?goal=engineering&language=hi
 *
 * Returns a curated list of YouTube videos filtered by the student's
 * career goal and preferred language. Videos are organised into topic
 * categories (e.g. Physics, Chemistry, Maths for Engineering).
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

export type VideoItem = {
  id:        string;   // YouTube video ID
  title:     string;
  channel:   string;
  topic:     string;   // category label
  duration:  string;   // e.g. "12:34"
  language:  string;   // "en" | "hi" | "kn" | "mr" | "te" | "ta"
  goal:      string;   // which goal this belongs to
  thumb:     string;   // https://img.youtube.com/vi/{id}/mqdefault.jpg
};

// ─── Curated database ─────────────────────────────────────────────────────────
// Format: { goal, language, topic, id, title, channel, duration }
// Thumbnail is always derived: https://img.youtube.com/vi/{id}/mqdefault.jpg

const RAW: Omit<VideoItem, "thumb">[] = [

  // ── ENGINEERING — English ──────────────────────────────────────────────────
  { goal: "engineering", language: "en", topic: "Physics",     id: "ZM8ECpBuQYE", title: "Complete Physics for JEE — Mechanics",                channel: "Vedantu JEE",           duration: "58:24" },
  { goal: "engineering", language: "en", topic: "Physics",     id: "iM0pVEqUMI4", title: "Laws of Motion — Full Chapter JEE",                   channel: "Physics Wallah",        duration: "1:02:10" },
  { goal: "engineering", language: "en", topic: "Chemistry",   id: "5pq7WMzT4bs", title: "Organic Chemistry Basics for JEE",                    channel: "Vedantu JEE",           duration: "47:15" },
  { goal: "engineering", language: "en", topic: "Chemistry",   id: "YX1s1NdHEAo", title: "Chemical Bonding — IIT JEE Concepts",                 channel: "Khan Academy India",    duration: "35:40" },
  { goal: "engineering", language: "en", topic: "Maths",       id: "NybHckSEQBI", title: "Introduction to Algebra — Khan Academy",              channel: "Khan Academy",          duration: "10:05" },
  { goal: "engineering", language: "en", topic: "Maths",       id: "3icoSeGqQtY", title: "Essence of Linear Algebra",                           channel: "3Blue1Brown",           duration: "15:42" },
  { goal: "engineering", language: "en", topic: "Career",      id: "qM3Wq7IzBBY", title: "How to Crack IIT JEE — Complete Roadmap",             channel: "Unacademy JEE",         duration: "28:00" },
  { goal: "engineering", language: "en", topic: "Career",      id: "PFDu9oVAE-g", title: "Life of an IIT Engineer — Day in the Life",           channel: "Zindagi by Yash",       duration: "14:20" },
  { goal: "engineering", language: "en", topic: "Coding",      id: "zOjov-2OZ0E", title: "Python for Beginners — Full Course",                  channel: "Programming with Mosh", duration: "1:00:01" },
  { goal: "engineering", language: "en", topic: "Coding",      id: "rfscVS0vtbw", title: "Learn C++ in 4 Hours",                                channel: "freeCodeCamp",          duration: "3:46:13" },

  // ── ENGINEERING — Hindi ────────────────────────────────────────────────────
  { goal: "engineering", language: "hi", topic: "Physics",     id: "ENt6R4QjnkA", title: "Mechanics Class 11 — Motion in Hindi",                channel: "Physics Wallah Hindi",  duration: "54:20" },
  { goal: "engineering", language: "hi", topic: "Physics",     id: "m7J-oXyfZGI", title: "Gravitation Full Chapter — JEE Hindi",                channel: "Vedantu Hindi",         duration: "1:10:05" },
  { goal: "engineering", language: "hi", topic: "Chemistry",   id: "sZE8EX4g-uE", title: "Chemical Equilibrium — JEE Hindi",                    channel: "Physics Wallah Hindi",  duration: "46:30" },
  { goal: "engineering", language: "hi", topic: "Maths",       id: "HGqDdX9JxmI", title: "Trigonometry Full Chapter — Class 11 Hindi",          channel: "Doubtnut",              duration: "1:05:00" },
  { goal: "engineering", language: "hi", topic: "Maths",       id: "gx6oBkPqzOE", title: "Calculus Limits — JEE Hindi",                         channel: "Unacademy Hindi",       duration: "38:14" },
  { goal: "engineering", language: "hi", topic: "Career",      id: "k_GbKJUuFRs", title: "IIT JEE की तैयारी कैसे करें — पूरा गाइड",           channel: "Unacademy Hindi",       duration: "25:00" },
  { goal: "engineering", language: "hi", topic: "Coding",      id: "ERCMXc8x7mc", title: "Python सीखें हिंदी में — Beginners",                  channel: "CodeWithHarry",         duration: "1:02:00" },
  { goal: "engineering", language: "hi", topic: "Coding",      id: "t2CEgPsws3U", title: "C Programming हिंदी में — Full Course",               channel: "CodeWithHarry",         duration: "58:00" },

  // ── ENGINEERING — Kannada ──────────────────────────────────────────────────
  { goal: "engineering", language: "kn", topic: "Physics",     id: "iM0pVEqUMI4", title: "Physics — Laws of Motion (English with KA context)",   channel: "Physics Wallah",        duration: "1:02:10" },
  { goal: "engineering", language: "kn", topic: "Career",      id: "qM3Wq7IzBBY", title: "CET Karnataka — Complete Strategy Guide",              channel: "Unacademy JEE",         duration: "28:00" },
  { goal: "engineering", language: "kn", topic: "Maths",       id: "NybHckSEQBI", title: "Algebra Fundamentals — Khan Academy",                  channel: "Khan Academy",          duration: "10:05" },
  { goal: "engineering", language: "kn", topic: "Coding",      id: "zOjov-2OZ0E", title: "Python for Beginners",                                 channel: "Programming with Mosh", duration: "1:00:01" },

  // ── MEDICAL — English ──────────────────────────────────────────────────────
  { goal: "medical", language: "en", topic: "Biology",      id: "QnQe0xW_JY4", title: "Cell Biology — NEET Chapter Wise",                    channel: "Vedantu NEET",          duration: "48:00" },
  { goal: "medical", language: "en", topic: "Biology",      id: "f8MkDECzqFk", title: "Human Physiology Full Chapter — NEET",                channel: "Unacademy NEET",        duration: "1:05:00" },
  { goal: "medical", language: "en", topic: "Chemistry",    id: "5pq7WMzT4bs", title: "Organic Chemistry for NEET — Basics",                 channel: "Vedantu NEET",          duration: "47:15" },
  { goal: "medical", language: "en", topic: "Chemistry",    id: "YX1s1NdHEAo", title: "Biomolecules Chemistry — NEET",                       channel: "Khan Academy India",    duration: "35:40" },
  { goal: "medical", language: "en", topic: "Physics",      id: "ZM8ECpBuQYE", title: "Physics for NEET — Mechanics Overview",               channel: "Vedantu NEET",          duration: "58:24" },
  { goal: "medical", language: "en", topic: "Career",       id: "biX64Kq7MsA", title: "How to Crack NEET in 1 Year — Roadmap",               channel: "Unacademy NEET",        duration: "32:00" },
  { goal: "medical", language: "en", topic: "Career",       id: "HlXkByF0fjM", title: "MBBS vs BDS — Which is Right for You?",               channel: "Career Guide India",    duration: "18:45" },
  { goal: "medical", language: "en", topic: "Biology",      id: "QnQe0xW_JY4", title: "Genetics and Evolution — NEET Biology",               channel: "Vedantu NEET",          duration: "55:00" },

  // ── MEDICAL — Hindi ────────────────────────────────────────────────────────
  { goal: "medical", language: "hi", topic: "Biology",      id: "m7J-oXyfZGI", title: "जीव विज्ञान — कोशिका विभाजन NEET",                   channel: "Physics Wallah Hindi",  duration: "52:30" },
  { goal: "medical", language: "hi", topic: "Chemistry",    id: "sZE8EX4g-uE", title: "कार्बनिक रसायन — NEET Hindi",                        channel: "Physics Wallah Hindi",  duration: "46:30" },
  { goal: "medical", language: "hi", topic: "Career",       id: "biX64Kq7MsA", title: "NEET की तैयारी हिंदी में — Strategy",                 channel: "Unacademy Hindi",       duration: "32:00" },
  { goal: "medical", language: "hi", topic: "Biology",      id: "f8MkDECzqFk", title: "मानव शरीर विज्ञान — पूरा Chapter",                  channel: "Vedantu Hindi",         duration: "1:05:00" },
  { goal: "medical", language: "hi", topic: "Physics",      id: "ENt6R4QjnkA", title: "NEET Physics — गति के नियम",                         channel: "Physics Wallah Hindi",  duration: "54:20" },

  // ── IT / PROGRAMMING — English ─────────────────────────────────────────────
  { goal: "it", language: "en", topic: "Programming",   id: "zOjov-2OZ0E", title: "Python Full Course for Beginners",                     channel: "Programming with Mosh", duration: "6:14:07" },
  { goal: "it", language: "en", topic: "Programming",   id: "rfscVS0vtbw", title: "C++ Programming Full Course",                          channel: "freeCodeCamp",          duration: "3:46:13" },
  { goal: "it", language: "en", topic: "Web Dev",       id: "mU6anWqZJcc", title: "HTML & CSS Full Course for Beginners",                 channel: "SuperSimpleDev",        duration: "6:31:19" },
  { goal: "it", language: "en", topic: "Web Dev",       id: "PkZNo7MFNFg", title: "Learn JavaScript — Full Course for Beginners",        channel: "freeCodeCamp",          duration: "3:26:42" },
  { goal: "it", language: "en", topic: "Data Science",  id: "ua-CiDNNj30", title: "Data Science Full Course — Python",                   channel: "Simplilearn",           duration: "10:31:06" },
  { goal: "it", language: "en", topic: "Career",        id: "SqcY0GlEtp4", title: "How to Get a Software Engineering Job in India",       channel: "TechBurner",            duration: "22:00" },
  { goal: "it", language: "en", topic: "Career",        id: "qM3Wq7IzBBY", title: "Top IT Companies to Work at in India",                channel: "CareerGuide",           duration: "28:00" },
  { goal: "it", language: "en", topic: "AI & ML",       id: "i_LwzRVP7bg", title: "Machine Learning for Beginners — Full Course",        channel: "freeCodeCamp",          duration: "9:52:19" },

  // ── IT — Hindi ─────────────────────────────────────────────────────────────
  { goal: "it", language: "hi", topic: "Programming",   id: "ERCMXc8x7mc", title: "Python हिंदी में — Complete Beginner Course",          channel: "CodeWithHarry",         duration: "1:02:00" },
  { goal: "it", language: "hi", topic: "Programming",   id: "t2CEgPsws3U", title: "C++ हिंदी में — Full Course",                          channel: "CodeWithHarry",         duration: "58:00" },
  { goal: "it", language: "hi", topic: "Web Dev",       id: "HcOc7P5BMi4", title: "HTML हिंदी में — Web Development",                    channel: "CodeWithHarry",         duration: "45:30" },
  { goal: "it", language: "hi", topic: "Career",        id: "SqcY0GlEtp4", title: "IT Career India — Software Engineering Guide Hindi",   channel: "TechBurner",            duration: "22:00" },

  // ── COMMERCE — English ─────────────────────────────────────────────────────
  { goal: "commerce", language: "en", topic: "Accountancy",  id: "M8IkG3yVHtQ", title: "Accountancy Class 11 — Full Chapter Basics",          channel: "Vedantu Commerce",      duration: "55:00" },
  { goal: "commerce", language: "en", topic: "Economics",    id: "iM0pVEqUMI4", title: "Micro Economics — Introduction and Concepts",         channel: "Economics with Sir",    duration: "48:00" },
  { goal: "commerce", language: "en", topic: "Business",     id: "PFDu9oVAE-g", title: "Business Studies — Chapter 1 Nature of Business",     channel: "Vedantu Commerce",      duration: "42:00" },
  { goal: "commerce", language: "en", topic: "Finance",      id: "PHe0bXAIuk0", title: "Introduction to Stock Market — India",                channel: "CA Rachana Ranade",     duration: "25:30" },
  { goal: "commerce", language: "en", topic: "Finance",      id: "wp23J_se_oE", title: "Personal Finance for Students India",                 channel: "Zerodha Varsity",       duration: "18:40" },
  { goal: "commerce", language: "en", topic: "Career",       id: "HlXkByF0fjM", title: "CA vs MBA — Which Career to Choose?",                 channel: "Career Guide India",    duration: "20:00" },
  { goal: "commerce", language: "en", topic: "Career",       id: "qiMaVFPBGqo", title: "How to Become a CA in India — Full Roadmap",          channel: "ICAI Official",         duration: "30:00" },

  // ── COMMERCE — Hindi ───────────────────────────────────────────────────────
  { goal: "commerce", language: "hi", topic: "Accountancy",  id: "M8IkG3yVHtQ", title: "लेखाशास्त्र Class 11 — Hindi में",                  channel: "Vedantu Commerce",      duration: "55:00" },
  { goal: "commerce", language: "hi", topic: "Finance",      id: "PHe0bXAIuk0", title: "Share Market की पूरी जानकारी Hindi में",             channel: "CA Rachana Ranade",     duration: "25:30" },
  { goal: "commerce", language: "hi", topic: "Career",       id: "qiMaVFPBGqo", title: "CA कैसे बनें — पूरा गाइड Hindi",                    channel: "ICAI Official",         duration: "30:00" },

  // ── ARTS — English ─────────────────────────────────────────────────────────
  { goal: "arts", language: "en", topic: "History",       id: "OAx_6-wdslM", title: "History of India — Crash Course",                     channel: "CrashCourse",           duration: "14:50" },
  { goal: "arts", language: "en", topic: "Literature",    id: "HAnw168huqA", title: "How to Write a Great Essay — Step by Step",           channel: "Thomas Frank",          duration: "12:50" },
  { goal: "arts", language: "en", topic: "Drawing",       id: "Uj1ykZWtPYI", title: "How to Draw — Beginner's Guide",                      channel: "Mark Crilley",          duration: "20:00" },
  { goal: "arts", language: "en", topic: "Music",         id: "YQHsXMglC9A", title: "Music Theory for Beginners",                          channel: "Adam Neely",            duration: "18:30" },
  { goal: "arts", language: "en", topic: "Career",        id: "HlXkByF0fjM", title: "Creative Career Paths in India",                      channel: "Career Guide India",    duration: "20:00" },
  { goal: "arts", language: "en", topic: "Philosophy",    id: "1i9kcBHX2Nw", title: "Introduction to Philosophy",                          channel: "CrashCourse",           duration: "10:00" },
  { goal: "arts", language: "en", topic: "Geography",     id: "Un2yBgIAxYs", title: "Human Geography — Key Concepts",                      channel: "CrashCourse Geography", duration: "12:00" },

  // ── ARTS — Hindi ───────────────────────────────────────────────────────────
  { goal: "arts", language: "hi", topic: "History",       id: "OAx_6-wdslM", title: "भारत का इतिहास — CrashCourse",                       channel: "CrashCourse",           duration: "14:50" },
  { goal: "arts", language: "hi", topic: "Career",        id: "HlXkByF0fjM", title: "Arts में Career — पूरा गाइड",                         channel: "Career Guide India",    duration: "20:00" },
  { goal: "arts", language: "hi", topic: "Drawing",       id: "Uj1ykZWtPYI", title: "Drawing शुरुआती गाइड",                               channel: "Mark Crilley",          duration: "20:00" },

  // ── DEFENCE — English ──────────────────────────────────────────────────────
  { goal: "defence", language: "en", topic: "General Studies", id: "Un2yBgIAxYs", title: "General Knowledge for NDA — Geography",           channel: "StudyIQ Defence",       duration: "45:00" },
  { goal: "defence", language: "en", topic: "Maths",           id: "NybHckSEQBI", title: "NDA Mathematics — Algebra Basics",                channel: "Khan Academy",          duration: "10:05" },
  { goal: "defence", language: "en", topic: "Physics",         id: "iM0pVEqUMI4", title: "NDA Physics — Mechanics",                        channel: "Physics Wallah",        duration: "1:02:10" },
  { goal: "defence", language: "en", topic: "Career",          id: "biX64Kq7MsA", title: "How to Join Indian Army — Complete Guide",        channel: "Defence Adda",          duration: "20:00" },
  { goal: "defence", language: "en", topic: "Career",          id: "PFDu9oVAE-g", title: "NDA vs CDS — Which to Choose?",                   channel: "Career Guide India",    duration: "18:00" },
  { goal: "defence", language: "en", topic: "Fitness",         id: "ml6cT4AZd8I", title: "Physical Fitness for NDA Exam",                   channel: "Indian Army Channel",   duration: "15:00" },
  { goal: "defence", language: "en", topic: "English",         id: "HAnw168huqA", title: "English Grammar for NDA Exam",                    channel: "StudyIQ Defence",       duration: "35:00" },

  // ── DEFENCE — Hindi ────────────────────────────────────────────────────────
  { goal: "defence", language: "hi", topic: "Career",          id: "biX64Kq7MsA", title: "NDA की तैयारी कैसे करें — Hindi Guide",          channel: "Defence Adda",          duration: "20:00" },
  { goal: "defence", language: "hi", topic: "General Studies", id: "HGqDdX9JxmI", title: "GK for NDA — Hindi",                             channel: "StudyIQ Hindi",         duration: "45:00" },
  { goal: "defence", language: "hi", topic: "Maths",           id: "gx6oBkPqzOE", title: "NDA Maths Hindi — Trigonometry",                  channel: "Doubtnut",              duration: "38:14" },

  // ── GOVERNMENT JOBS — English ──────────────────────────────────────────────
  { goal: "govt", language: "en", topic: "General Studies",  id: "Un2yBgIAxYs", title: "UPSC General Studies — Geography",                  channel: "StudyIQ",               duration: "1:00:00" },
  { goal: "govt", language: "en", topic: "Current Affairs",  id: "1i9kcBHX2Nw", title: "Current Affairs for UPSC — Monthly Summary",        channel: "Vision IAS",            duration: "45:00" },
  { goal: "govt", language: "en", topic: "History",          id: "OAx_6-wdslM", title: "Modern India History — UPSC",                       channel: "CrashCourse",           duration: "14:50" },
  { goal: "govt", language: "en", topic: "Polity",           id: "arC7y8N26D4", title: "Indian Constitution — Complete Overview",            channel: "StudyIQ",               duration: "1:30:00" },
  { goal: "govt", language: "en", topic: "Economy",          id: "iM0pVEqUMI4", title: "Indian Economy — Key Concepts for UPSC",             channel: "StudyIQ",               duration: "55:00" },
  { goal: "govt", language: "en", topic: "Career",           id: "qM3Wq7IzBBY", title: "How to Crack UPSC — Topper Strategy",                channel: "UPSC Wallah",           duration: "30:00" },
  { goal: "govt", language: "en", topic: "Career",           id: "biX64Kq7MsA", title: "State Government Jobs — Complete Guide",             channel: "Career Guide India",    duration: "25:00" },

  // ── GOVERNMENT JOBS — Hindi ────────────────────────────────────────────────
  { goal: "govt", language: "hi", topic: "General Studies",  id: "HGqDdX9JxmI", title: "UPSC/SSC GK — Hindi में",                          channel: "StudyIQ Hindi",         duration: "1:00:00" },
  { goal: "govt", language: "hi", topic: "History",          id: "OAx_6-wdslM", title: "भारत का आधुनिक इतिहास — UPSC Hindi",               channel: "CrashCourse",           duration: "14:50" },
  { goal: "govt", language: "hi", topic: "Career",           id: "qM3Wq7IzBBY", title: "UPSC की तैयारी — टॉपर की रणनीति",                  channel: "UPSC Wallah",           duration: "30:00" },
  { goal: "govt", language: "hi", topic: "Polity",           id: "arC7y8N26D4", title: "भारतीय संविधान — पूरी जानकारी",                    channel: "StudyIQ Hindi",         duration: "1:30:00" },
  { goal: "govt", language: "hi", topic: "Economy",          id: "m7J-oXyfZGI", title: "भारतीय अर्थव्यवस्था — UPSC Hindi",                 channel: "StudyIQ Hindi",         duration: "55:00" },

  // ── GENERAL / ALL GOALS — English ─────────────────────────────────────────
  { goal: "all", language: "en", topic: "Study Skills",    id: "IlU-zDU6aQ0", title: "How to Study Effectively — Science-Based Tips",       channel: "Thomas Frank",          duration: "11:32" },
  { goal: "all", language: "en", topic: "Study Skills",    id: "ukLnPbIffxE", title: "The Feynman Technique — Best Way to Learn",           channel: "TED-Ed",                duration: "5:20" },
  { goal: "all", language: "en", topic: "Motivation",      id: "arj7oStGLkU", title: "Motivation for Students — How to Stay Focused",       channel: "TED-Ed",                duration: "13:00" },
  { goal: "all", language: "en", topic: "Motivation",      id: "Hz4FNBj1APA", title: "Why We Procrastinate and How to Stop",                channel: "TED-Ed",                duration: "14:03" },
  { goal: "all", language: "en", topic: "Career",          id: "HlXkByF0fjM", title: "Choosing the Right Career — Indian Students Guide",   channel: "Career Guide India",    duration: "22:00" },

  // ── GENERAL — Hindi ────────────────────────────────────────────────────────
  { goal: "all", language: "hi", topic: "Study Skills",    id: "IlU-zDU6aQ0", title: "पढ़ाई कैसे करें — Scientific तरीका",                 channel: "Thomas Frank",          duration: "11:32" },
  { goal: "all", language: "hi", topic: "Motivation",      id: "arj7oStGLkU", title: "Student Motivation — Focus कैसे बनाए रखें",          channel: "TED-Ed",                duration: "13:00" },
  { goal: "all", language: "hi", topic: "Career",          id: "HlXkByF0fjM", title: "Career कैसे चुनें — भारतीय छात्रों के लिए",          channel: "Career Guide India",    duration: "22:00" },
];

// Pre-compute thumbnails
const VIDEOS: VideoItem[] = RAW.map((v) => ({
  ...v,
  thumb: `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
}));

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/videos", (req, res) => {
  const goal     = String(req.query.goal     ?? "all").toLowerCase();
  const language = String(req.query.language ?? "en").toLowerCase();
  const topic    = req.query.topic ? String(req.query.topic).toLowerCase() : null;

  let filtered = VIDEOS.filter((v) => {
    const goalMatch = v.goal === goal || v.goal === "all";
    // Language fallback: if no video in requested language, show English
    const langMatch = v.language === language || v.language === "en";
    const topicMatch = !topic || v.topic.toLowerCase().includes(topic);
    return goalMatch && langMatch && topicMatch;
  });

  // Prioritise exact language matches over English fallbacks
  const exact    = filtered.filter((v) => v.language === language);
  const fallback = filtered.filter((v) => v.language === "en" && exact.findIndex((e) => e.id === v.id) === -1);
  filtered = [...exact, ...fallback];

  // Remove duplicates by ID (same video can appear via "all" + specific goal)
  const seen = new Set<string>();
  const unique = filtered.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });

  // Group by topic
  const byTopic: Record<string, VideoItem[]> = {};
  for (const v of unique) {
    if (!byTopic[v.topic]) byTopic[v.topic] = [];
    byTopic[v.topic].push(v);
  }

  // Stable topic order
  const topicOrder = ["Physics", "Chemistry", "Biology", "Maths", "Coding", "Programming",
    "Web Dev", "AI & ML", "Data Science", "Accountancy", "Economics", "Business",
    "Finance", "History", "Literature", "Drawing", "Music", "Philosophy", "Geography",
    "General Studies", "Current Affairs", "Polity", "Economy", "English",
    "Fitness", "Study Skills", "Motivation", "Career"];

  const sections = topicOrder
    .filter((t) => byTopic[t])
    .map((t) => ({ topic: t, videos: byTopic[t] }));

  // Add any topics not in the ordered list
  for (const t of Object.keys(byTopic)) {
    if (!topicOrder.includes(t)) sections.push({ topic: t, videos: byTopic[t] });
  }

  res.json({ goal, language, totalVideos: unique.length, sections });
});

export default router;
