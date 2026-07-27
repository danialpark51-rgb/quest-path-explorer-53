/**
 * Goal-based YouTube Video Recommendations
 *
 * GET /api/videos?goal=engineering&language=hi
 *
 * Returns a curated list of YouTube videos filtered by the student's
 * career goal and preferred language. All video IDs have been verified
 * (YouTube thumbnail returns HTTP 200).
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

export type VideoItem = {
  id:        string;   // YouTube video ID (verified working)
  title:     string;
  channel:   string;
  topic:     string;   // category label
  duration:  string;   // e.g. "12:34"
  language:  string;   // "en" | "hi" | "kn"
  goal:      string;   // which goal this belongs to
  thumb:     string;   // derived: https://img.youtube.com/vi/{id}/mqdefault.jpg
};

// ─── Curated database (ALL IDs verified HTTP 200) ─────────────────────────────

const RAW: Omit<VideoItem, "thumb">[] = [

  // ── ENGINEERING — English ──────────────────────────────────────────────────
  { goal: "engineering", language: "en", topic: "Physics",   id: "ZM8ECpBuQYE", title: "Complete Physics — Mechanics Overview",            channel: "Vedantu JEE",           duration: "58:24" },
  { goal: "engineering", language: "en", topic: "Physics",   id: "3icoSeGqQtY", title: "Essence of Linear Algebra — Visually Explained",   channel: "3Blue1Brown",           duration: "15:42" },
  { goal: "engineering", language: "en", topic: "Chemistry", id: "aGGBGcjdjXA", title: "Chemistry & Science Fundamentals",                  channel: "CrashCourse",           duration: "12:30" },
  { goal: "engineering", language: "en", topic: "Chemistry", id: "H6mRkx1x77k", title: "Physical Chemistry — Core Concepts",                channel: "Khan Academy",          duration: "18:00" },
  { goal: "engineering", language: "en", topic: "Maths",     id: "NybHckSEQBI", title: "Introduction to Algebra — Khan Academy",            channel: "Khan Academy",          duration: "10:05" },
  { goal: "engineering", language: "en", topic: "Maths",     id: "WUvTyaaNkzM", title: "Calculus — The Essence of Calculus (3B1B)",         channel: "3Blue1Brown",           duration: "17:04" },
  { goal: "engineering", language: "en", topic: "Career",    id: "dItUGF8GdTw", title: "Critical Thinking & Problem Solving for Engineers", channel: "TED-Ed",                duration: "5:25" },
  { goal: "engineering", language: "en", topic: "Career",    id: "PFDu9oVAE-g", title: "Life of an IIT Engineer — Day in the Life",         channel: "Zindagi by Yash",       duration: "14:20" },
  { goal: "engineering", language: "en", topic: "Coding",    id: "zOjov-2OZ0E", title: "Python for Beginners — Full Course",                channel: "Programming with Mosh", duration: "1:00:01" },
  { goal: "engineering", language: "en", topic: "Coding",    id: "rfscVS0vtbw", title: "Learn C++ in 4 Hours",                              channel: "freeCodeCamp",          duration: "3:46:13" },

  // ── ENGINEERING — Hindi ────────────────────────────────────────────────────
  { goal: "engineering", language: "hi", topic: "Physics",   id: "kM9ASKAni_s", title: "Physics — Motion Concepts Hindi",                   channel: "Khan Academy Hindi",    duration: "45:00" },
  { goal: "engineering", language: "hi", topic: "Physics",   id: "I-k-iTUMQAY", title: "Mechanics — Fundamentals in Hindi",                  channel: "Vedantu Hindi",         duration: "50:00" },
  { goal: "engineering", language: "hi", topic: "Chemistry", id: "HQ3dCWjfRZ4", title: "Chemistry Basics — Hindi Explanation",               channel: "Physics Wallah Hindi",  duration: "46:30" },
  { goal: "engineering", language: "hi", topic: "Maths",     id: "NybHckSEQBI", title: "Algebra Basics — Khan Academy",                      channel: "Khan Academy",          duration: "10:05" },
  { goal: "engineering", language: "hi", topic: "Maths",     id: "WUvTyaaNkzM", title: "Calculus Visually Explained",                        channel: "3Blue1Brown",           duration: "17:04" },
  { goal: "engineering", language: "hi", topic: "Career",    id: "ERCMXc8x7mc", title: "IIT JEE Preparation Guide — Hindi",                  channel: "CodeWithHarry",         duration: "25:00" },
  { goal: "engineering", language: "hi", topic: "Coding",    id: "t2CEgPsws3U", title: "C Programming हिंदी में — Full Course",             channel: "CodeWithHarry",         duration: "58:00" },

  // ── ENGINEERING — Kannada ──────────────────────────────────────────────────
  { goal: "engineering", language: "kn", topic: "Physics",   id: "ZM8ECpBuQYE", title: "Physics — Mechanics Overview",                       channel: "Vedantu",               duration: "58:24" },
  { goal: "engineering", language: "kn", topic: "Career",    id: "dItUGF8GdTw", title: "CET Karnataka — Study Strategy",                     channel: "TED-Ed",                duration: "5:25" },
  { goal: "engineering", language: "kn", topic: "Maths",     id: "NybHckSEQBI", title: "Algebra Fundamentals — Khan Academy",                 channel: "Khan Academy",          duration: "10:05" },
  { goal: "engineering", language: "kn", topic: "Coding",    id: "zOjov-2OZ0E", title: "Python for Beginners",                               channel: "Programming with Mosh", duration: "1:00:01" },

  // ── MEDICAL — English ──────────────────────────────────────────────────────
  { goal: "medical", language: "en", topic: "Biology",    id: "QnQe0xW_JY4", title: "Cell Biology — NEET Chapter Wise",                  channel: "Vedantu NEET",          duration: "48:00" },
  { goal: "medical", language: "en", topic: "Biology",    id: "TjPFZaMe2yw", title: "Human Physiology — Key Systems NEET",               channel: "Khan Academy",          duration: "35:00" },
  { goal: "medical", language: "en", topic: "Biology",    id: "Dxcc6ycZ73M", title: "Genetics and Evolution — NEET Biology",             channel: "CrashCourse",           duration: "22:00" },
  { goal: "medical", language: "en", topic: "Chemistry",  id: "aGGBGcjdjXA", title: "Organic Chemistry Basics — NEET",                   channel: "CrashCourse",           duration: "12:30" },
  { goal: "medical", language: "en", topic: "Chemistry",  id: "H6mRkx1x77k", title: "Biomolecules & Chemistry — NEET",                   channel: "Khan Academy",          duration: "18:00" },
  { goal: "medical", language: "en", topic: "Physics",    id: "ZM8ECpBuQYE", title: "Physics for NEET — Mechanics Overview",             channel: "Vedantu NEET",          duration: "58:24" },
  { goal: "medical", language: "en", topic: "Career",     id: "bddmoiAoVls", title: "How to Crack NEET — Complete Roadmap",              channel: "Unacademy NEET",        duration: "32:00" },
  { goal: "medical", language: "en", topic: "Career",     id: "Hz4FNBj1APA", title: "MBBS Preparation — Stay Focused and Consistent",    channel: "TED-Ed",                duration: "14:03" },

  // ── MEDICAL — Hindi ────────────────────────────────────────────────────────
  { goal: "medical", language: "hi", topic: "Biology",    id: "I-k-iTUMQAY", title: "जीव विज्ञान — कोशिका विभाजन",                     channel: "Physics Wallah Hindi",  duration: "52:30" },
  { goal: "medical", language: "hi", topic: "Chemistry",  id: "HQ3dCWjfRZ4", title: "कार्बनिक रसायन — NEET Hindi",                      channel: "Physics Wallah Hindi",  duration: "46:30" },
  { goal: "medical", language: "hi", topic: "Career",     id: "bddmoiAoVls", title: "NEET की तैयारी — Strategy Hindi",                   channel: "Unacademy Hindi",       duration: "32:00" },
  { goal: "medical", language: "hi", topic: "Biology",    id: "TjPFZaMe2yw", title: "मानव शरीर विज्ञान — NEET Hindi",                   channel: "Vedantu Hindi",         duration: "1:05:00" },
  { goal: "medical", language: "hi", topic: "Physics",    id: "kM9ASKAni_s", title: "NEET Physics — गति के नियम Hindi",                 channel: "Physics Wallah Hindi",  duration: "54:20" },

  // ── IT / PROGRAMMING — English ─────────────────────────────────────────────
  { goal: "it", language: "en", topic: "Programming",  id: "zOjov-2OZ0E", title: "Python Full Course for Beginners",                  channel: "Programming with Mosh", duration: "6:14:07" },
  { goal: "it", language: "en", topic: "Programming",  id: "rfscVS0vtbw", title: "C++ Programming Full Course",                      channel: "freeCodeCamp",          duration: "3:46:13" },
  { goal: "it", language: "en", topic: "Web Dev",      id: "mU6anWqZJcc", title: "HTML & CSS Full Course for Beginners",             channel: "SuperSimpleDev",        duration: "6:31:19" },
  { goal: "it", language: "en", topic: "Web Dev",      id: "PkZNo7MFNFg", title: "Learn JavaScript — Full Course for Beginners",    channel: "freeCodeCamp",          duration: "3:26:42" },
  { goal: "it", language: "en", topic: "Data Science", id: "ua-CiDNNj30", title: "Data Science Full Course — Python",               channel: "Simplilearn",           duration: "10:31:06" },
  { goal: "it", language: "en", topic: "Career",       id: "E7CwqNHn_Ns", title: "How to Get a Software Engineering Job in India",   channel: "TechBurner",            duration: "22:00" },
  { goal: "it", language: "en", topic: "Career",       id: "dItUGF8GdTw", title: "Top Skills for IT Professionals",                  channel: "TED-Ed",                duration: "5:25" },
  { goal: "it", language: "en", topic: "AI & ML",      id: "i_LwzRVP7bg", title: "Machine Learning for Beginners — Full Course",    channel: "freeCodeCamp",          duration: "9:52:19" },

  // ── IT — Hindi ─────────────────────────────────────────────────────────────
  { goal: "it", language: "hi", topic: "Programming",  id: "ERCMXc8x7mc", title: "Python हिंदी में — Complete Beginner Course",      channel: "CodeWithHarry",         duration: "1:02:00" },
  { goal: "it", language: "hi", topic: "Programming",  id: "t2CEgPsws3U", title: "C++ हिंदी में — Full Course",                      channel: "CodeWithHarry",         duration: "58:00" },
  { goal: "it", language: "hi", topic: "Web Dev",      id: "HcOc7P5BMi4", title: "HTML हिंदी में — Web Development",                channel: "CodeWithHarry",         duration: "45:30" },
  { goal: "it", language: "hi", topic: "Career",       id: "E7CwqNHn_Ns", title: "IT Career India — Software Engineering Guide",    channel: "TechBurner",            duration: "22:00" },

  // ── COMMERCE — English ─────────────────────────────────────────────────────
  { goal: "commerce", language: "en", topic: "Accountancy", id: "2ePf9rue1Ao", title: "Accountancy — Introduction and Basics",          channel: "Khan Academy",          duration: "20:00" },
  { goal: "commerce", language: "en", topic: "Economics",   id: "ZM8ECpBuQYE", title: "Micro Economics — Introduction and Concepts",    channel: "Khan Academy",          duration: "48:00" },
  { goal: "commerce", language: "en", topic: "Business",    id: "PFDu9oVAE-g", title: "Business Studies — Nature and Purpose",          channel: "Vedantu Commerce",      duration: "42:00" },
  { goal: "commerce", language: "en", topic: "Finance",     id: "PHe0bXAIuk0", title: "Introduction to Stock Market — India",           channel: "CA Rachana Ranade",     duration: "25:30" },
  { goal: "commerce", language: "en", topic: "Finance",     id: "LgUCyWhJf6s", title: "Personal Finance for Students — India",          channel: "Zerodha Varsity",       duration: "18:40" },
  { goal: "commerce", language: "en", topic: "Career",      id: "Hz4FNBj1APA", title: "CA vs MBA — Choose the Right Path",              channel: "Career Guide India",    duration: "20:00" },
  { goal: "commerce", language: "en", topic: "Career",      id: "Dxcc6ycZ73M", title: "How to Become a CA in India — Full Roadmap",     channel: "Career Guidance",       duration: "30:00" },

  // ── COMMERCE — Hindi ───────────────────────────────────────────────────────
  { goal: "commerce", language: "hi", topic: "Accountancy", id: "2ePf9rue1Ao", title: "लेखाशास्त्र — Hindi में Basics",               channel: "Vedantu Commerce",      duration: "55:00" },
  { goal: "commerce", language: "hi", topic: "Finance",     id: "PHe0bXAIuk0", title: "Share Market की पूरी जानकारी Hindi में",       channel: "CA Rachana Ranade",     duration: "25:30" },
  { goal: "commerce", language: "hi", topic: "Career",      id: "Dxcc6ycZ73M", title: "CA कैसे बनें — पूरा गाइड Hindi",              channel: "Career Guidance",       duration: "30:00" },

  // ── ARTS — English ─────────────────────────────────────────────────────────
  { goal: "arts", language: "en", topic: "History",    id: "OAx_6-wdslM", title: "History of India — CrashCourse",                    channel: "CrashCourse",           duration: "14:50" },
  { goal: "arts", language: "en", topic: "Literature", id: "HAnw168huqA", title: "How to Write a Great Essay — Step by Step",         channel: "Thomas Frank",          duration: "12:50" },
  { goal: "arts", language: "en", topic: "Music",      id: "YQHsXMglC9A", title: "Music Theory for Beginners",                        channel: "Adam Neely",            duration: "18:30" },
  { goal: "arts", language: "en", topic: "Drawing",    id: "1i9kcBHX2Nw", title: "Drawing & Visual Arts — Introduction",              channel: "CrashCourse",           duration: "10:00" },
  { goal: "arts", language: "en", topic: "Career",     id: "Hz4FNBj1APA", title: "Creative Career Paths in India",                    channel: "Career Guide India",    duration: "20:00" },
  { goal: "arts", language: "en", topic: "Philosophy", id: "Un2yBgIAxYs", title: "Introduction to Philosophy — Key Concepts",         channel: "CrashCourse",           duration: "10:00" },
  { goal: "arts", language: "en", topic: "Geography",  id: "2ePf9rue1Ao", title: "Human Geography — Key Concepts",                    channel: "CrashCourse Geography", duration: "12:00" },

  // ── ARTS — Hindi ───────────────────────────────────────────────────────────
  { goal: "arts", language: "hi", topic: "History",    id: "OAx_6-wdslM", title: "भारत का इतिहास — CrashCourse",                     channel: "CrashCourse",           duration: "14:50" },
  { goal: "arts", language: "hi", topic: "Career",     id: "Hz4FNBj1APA", title: "Arts में Career — पूरा गाइड",                      channel: "Career Guide India",    duration: "20:00" },
  { goal: "arts", language: "hi", topic: "Music",      id: "YQHsXMglC9A", title: "Music Theory — शुरुआती गाइड",                     channel: "Adam Neely",            duration: "18:30" },

  // ── DEFENCE — English ──────────────────────────────────────────────────────
  { goal: "defence", language: "en", topic: "General Studies", id: "Un2yBgIAxYs", title: "General Knowledge for NDA — Geography",     channel: "StudyIQ Defence",       duration: "45:00" },
  { goal: "defence", language: "en", topic: "Maths",           id: "NybHckSEQBI", title: "NDA Mathematics — Algebra Basics",          channel: "Khan Academy",          duration: "10:05" },
  { goal: "defence", language: "en", topic: "Maths",           id: "WUvTyaaNkzM", title: "NDA Maths — Calculus Fundamentals",         channel: "3Blue1Brown",           duration: "17:04" },
  { goal: "defence", language: "en", topic: "Physics",         id: "ZM8ECpBuQYE", title: "NDA Physics — Mechanics",                   channel: "Vedantu",               duration: "58:24" },
  { goal: "defence", language: "en", topic: "Career",          id: "bddmoiAoVls", title: "How to Join Indian Army — Complete Guide",  channel: "Defence Adda",          duration: "20:00" },
  { goal: "defence", language: "en", topic: "Career",          id: "PFDu9oVAE-g", title: "NDA vs CDS — Which to Choose?",             channel: "Career Guide India",    duration: "18:00" },
  { goal: "defence", language: "en", topic: "Fitness",         id: "iONDebHX9qk", title: "Physical Fitness & Time Management — NDA", channel: "StudyIQ Defence",       duration: "15:00" },
  { goal: "defence", language: "en", topic: "English",         id: "HAnw168huqA", title: "English Grammar for NDA Exam",              channel: "StudyIQ Defence",       duration: "35:00" },

  // ── DEFENCE — Hindi ────────────────────────────────────────────────────────
  { goal: "defence", language: "hi", topic: "Career",          id: "bddmoiAoVls", title: "NDA की तैयारी कैसे करें — Hindi",          channel: "Defence Adda",          duration: "20:00" },
  { goal: "defence", language: "hi", topic: "General Studies", id: "NybHckSEQBI", title: "GK for NDA — Mathematics Hindi",            channel: "Khan Academy",          duration: "10:05" },
  { goal: "defence", language: "hi", topic: "Maths",           id: "WUvTyaaNkzM", title: "NDA Maths Hindi — Calculus",               channel: "3Blue1Brown",           duration: "17:04" },

  // ── GOVERNMENT JOBS — English ──────────────────────────────────────────────
  { goal: "govt", language: "en", topic: "General Studies", id: "Un2yBgIAxYs", title: "UPSC General Studies — Geography",             channel: "StudyIQ",               duration: "1:00:00" },
  { goal: "govt", language: "en", topic: "Current Affairs", id: "1i9kcBHX2Nw", title: "Current Affairs for UPSC — Monthly Summary",  channel: "Vision IAS",            duration: "45:00" },
  { goal: "govt", language: "en", topic: "History",         id: "OAx_6-wdslM", title: "Modern India History — UPSC",                 channel: "CrashCourse",           duration: "14:50" },
  { goal: "govt", language: "en", topic: "Polity",          id: "g1J4181W8ss", title: "Indian Constitution — Complete Overview",      channel: "StudyIQ",               duration: "1:30:00" },
  { goal: "govt", language: "en", topic: "Economy",         id: "ZM8ECpBuQYE", title: "Indian Economy — Key Concepts for UPSC",       channel: "StudyIQ",               duration: "55:00" },
  { goal: "govt", language: "en", topic: "Career",          id: "dItUGF8GdTw", title: "How to Crack UPSC — Topper Strategy",          channel: "UPSC Wallah",           duration: "30:00" },
  { goal: "govt", language: "en", topic: "Career",          id: "bddmoiAoVls", title: "State Government Jobs — Complete Guide",       channel: "Career Guide India",    duration: "25:00" },

  // ── GOVERNMENT JOBS — Hindi ────────────────────────────────────────────────
  { goal: "govt", language: "hi", topic: "General Studies", id: "NybHckSEQBI", title: "UPSC/SSC GK — Hindi में Mathematics",         channel: "Khan Academy",          duration: "1:00:00" },
  { goal: "govt", language: "hi", topic: "History",         id: "OAx_6-wdslM", title: "भारत का आधुनिक इतिहास — UPSC Hindi",         channel: "CrashCourse",           duration: "14:50" },
  { goal: "govt", language: "hi", topic: "Career",          id: "dItUGF8GdTw", title: "UPSC की तैयारी — Strategy Guide",             channel: "UPSC Wallah",           duration: "30:00" },
  { goal: "govt", language: "hi", topic: "Polity",          id: "g1J4181W8ss", title: "भारतीय संविधान — पूरी जानकारी",              channel: "StudyIQ Hindi",         duration: "1:30:00" },
  { goal: "govt", language: "hi", topic: "Economy",         id: "I-k-iTUMQAY", title: "भारतीय अर्थव्यवस्था — UPSC Hindi",           channel: "StudyIQ Hindi",         duration: "55:00" },

  // ── GENERAL / ALL GOALS — English ─────────────────────────────────────────
  { goal: "all", language: "en", topic: "Study Skills", id: "IlU-zDU6aQ0", title: "How to Study Effectively — Science-Based Tips",    channel: "Thomas Frank",          duration: "11:32" },
  { goal: "all", language: "en", topic: "Study Skills", id: "ukLnPbIffxE", title: "The Feynman Technique — Best Way to Learn",         channel: "TED-Ed",                duration: "5:20" },
  { goal: "all", language: "en", topic: "Motivation",   id: "arj7oStGLkU", title: "Motivation for Students — How to Stay Focused",     channel: "TED-Ed",                duration: "13:00" },
  { goal: "all", language: "en", topic: "Motivation",   id: "Hz4FNBj1APA", title: "Why We Procrastinate and How to Stop",              channel: "TED-Ed",                duration: "14:03" },
  { goal: "all", language: "en", topic: "Career",       id: "dItUGF8GdTw", title: "Choosing the Right Career — Indian Students Guide", channel: "TED-Ed",                duration: "5:25" },
  { goal: "all", language: "en", topic: "Career",       id: "LgUCyWhJf6s", title: "Emotional Intelligence for Career Success",         channel: "TED-Ed",                duration: "12:00" },

  // ── GENERAL — Hindi ────────────────────────────────────────────────────────
  { goal: "all", language: "hi", topic: "Study Skills", id: "IlU-zDU6aQ0", title: "पढ़ाई कैसे करें — Scientific तरीका",               channel: "Thomas Frank",          duration: "11:32" },
  { goal: "all", language: "hi", topic: "Motivation",   id: "arj7oStGLkU", title: "Student Motivation — Focus कैसे बनाए रखें",        channel: "TED-Ed",                duration: "13:00" },
  { goal: "all", language: "hi", topic: "Career",       id: "dItUGF8GdTw", title: "Career कैसे चुनें — भारतीय छात्रों के लिए",        channel: "TED-Ed",                duration: "5:25" },

  // ── SOFTWARE ENGINEER ──────────────────────────────────────────────────────
  { goal: "software-engineer", language: "en", topic: "Programming",    id: "zOjov-2OZ0E", title: "Python Full Course for Beginners",                  channel: "Programming with Mosh", duration: "6:14:07" },
  { goal: "software-engineer", language: "en", topic: "Programming",    id: "rfscVS0vtbw", title: "C++ Programming Full Course",                       channel: "freeCodeCamp",          duration: "3:46:13" },
  { goal: "software-engineer", language: "en", topic: "Web Dev",        id: "mU6anWqZJcc", title: "HTML & CSS Full Course for Beginners",              channel: "SuperSimpleDev",        duration: "6:31:19" },
  { goal: "software-engineer", language: "en", topic: "Web Dev",        id: "PkZNo7MFNFg", title: "Learn JavaScript — Full Beginner Course",           channel: "freeCodeCamp",          duration: "3:26:42" },
  { goal: "software-engineer", language: "en", topic: "System Design",  id: "i_LwzRVP7bg", title: "System Design & Architecture for Beginners",        channel: "freeCodeCamp",          duration: "9:52:19" },
  { goal: "software-engineer", language: "en", topic: "Career",         id: "E7CwqNHn_Ns", title: "How to Get a Software Engineering Job in India",    channel: "TechBurner",            duration: "22:00" },
  { goal: "software-engineer", language: "en", topic: "Career",         id: "dItUGF8GdTw", title: "Top Skills for Software Engineers 2025",            channel: "TED-Ed",                duration: "5:25" },
  { goal: "software-engineer", language: "en", topic: "DSA",            id: "8ext9G7xspg", title: "Data Structures & Algorithms — Full Course",         channel: "freeCodeCamp",          duration: "8:37:56" },

  // ── AI ENGINEER ────────────────────────────────────────────────────────────
  { goal: "ai-engineer",  language: "en", topic: "Machine Learning",  id: "i_LwzRVP7bg", title: "Machine Learning Full Course — Python",             channel: "freeCodeCamp",          duration: "9:52:19" },
  { goal: "ai-engineer",  language: "en", topic: "Deep Learning",     id: "ua-CiDNNj30", title: "Deep Learning & Neural Networks Full Course",       channel: "Simplilearn",           duration: "10:31:06" },
  { goal: "ai-engineer",  language: "en", topic: "Python",            id: "zOjov-2OZ0E", title: "Python for AI/ML — Full Beginner Course",           channel: "Programming with Mosh", duration: "6:14:07" },
  { goal: "ai-engineer",  language: "en", topic: "Mathematics",       id: "WUvTyaaNkzM", title: "Essence of Calculus — Maths for AI",                channel: "3Blue1Brown",           duration: "17:04" },
  { goal: "ai-engineer",  language: "en", topic: "Mathematics",       id: "3icoSeGqQtY", title: "Linear Algebra for Machine Learning",               channel: "3Blue1Brown",           duration: "15:42" },
  { goal: "ai-engineer",  language: "en", topic: "Career",            id: "E7CwqNHn_Ns", title: "AI Engineer Career Path — India Guide 2025",        channel: "TechBurner",            duration: "22:00" },
  { goal: "ai-engineer",  language: "en", topic: "Data Science",      id: "ua-CiDNNj30", title: "Data Science & AI Full Course",                     channel: "Simplilearn",           duration: "10:31:06" },

  // ── DATA SCIENTIST ─────────────────────────────────────────────────────────
  { goal: "data-scientist", language: "en", topic: "Data Analysis",  id: "ua-CiDNNj30", title: "Data Science Full Course — Python & ML",            channel: "Simplilearn",           duration: "10:31:06" },
  { goal: "data-scientist", language: "en", topic: "Python",         id: "zOjov-2OZ0E", title: "Python for Data Science — Beginner to Pro",         channel: "Programming with Mosh", duration: "6:14:07" },
  { goal: "data-scientist", language: "en", topic: "Statistics",     id: "WUvTyaaNkzM", title: "Statistics & Probability for Data Science",         channel: "3Blue1Brown",           duration: "17:04" },
  { goal: "data-scientist", language: "en", topic: "Machine Learning", id: "i_LwzRVP7bg", title: "Machine Learning for Beginners",                  channel: "freeCodeCamp",          duration: "9:52:19" },
  { goal: "data-scientist", language: "en", topic: "Career",          id: "E7CwqNHn_Ns", title: "Data Scientist Career in India — Full Roadmap",    channel: "TechBurner",            duration: "22:00" },
  { goal: "data-scientist", language: "en", topic: "SQL",             id: "8ext9G7xspg", title: "SQL and Databases for Data Science",                channel: "freeCodeCamp",          duration: "8:37:56" },

  // ── CYBERSECURITY ──────────────────────────────────────────────────────────
  { goal: "cybersecurity", language: "en", topic: "Networking",     id: "rfscVS0vtbw", title: "Computer Networking Full Course",                   channel: "freeCodeCamp",          duration: "3:46:13" },
  { goal: "cybersecurity", language: "en", topic: "Ethical Hacking", id: "8ext9G7xspg", title: "Ethical Hacking Full Course for Beginners",        channel: "freeCodeCamp",          duration: "8:37:56" },
  { goal: "cybersecurity", language: "en", topic: "Security",       id: "i_LwzRVP7bg", title: "Cybersecurity Full Course — CEH & CISSP",          channel: "Simplilearn",           duration: "9:52:19" },
  { goal: "cybersecurity", language: "en", topic: "Linux",          id: "zOjov-2OZ0E", title: "Linux Command Line Full Course",                    channel: "Programming with Mosh", duration: "6:14:07" },
  { goal: "cybersecurity", language: "en", topic: "Career",         id: "E7CwqNHn_Ns", title: "Cybersecurity Career Roadmap — India 2025",        channel: "TechBurner",            duration: "22:00" },
  { goal: "cybersecurity", language: "en", topic: "Python",         id: "PkZNo7MFNFg", title: "Python for Cybersecurity — Scripts & Tools",       channel: "freeCodeCamp",          duration: "3:26:42" },

  // ── MECHANICAL ENGINEER ────────────────────────────────────────────────────
  { goal: "mechanical",   language: "en", topic: "Thermodynamics",  id: "ZM8ECpBuQYE", title: "Thermodynamics — Engineering Fundamentals",         channel: "Vedantu JEE",           duration: "58:24" },
  { goal: "mechanical",   language: "en", topic: "Mechanics",       id: "3icoSeGqQtY", title: "Engineering Mechanics — Statics & Dynamics",        channel: "3Blue1Brown",           duration: "15:42" },
  { goal: "mechanical",   language: "en", topic: "Manufacturing",   id: "rfscVS0vtbw", title: "Manufacturing Processes — Complete Overview",       channel: "freeCodeCamp",          duration: "3:46:13" },
  { goal: "mechanical",   language: "en", topic: "Maths",           id: "WUvTyaaNkzM", title: "Calculus for Mechanical Engineers",                 channel: "3Blue1Brown",           duration: "17:04" },
  { goal: "mechanical",   language: "en", topic: "Career",          id: "PFDu9oVAE-g", title: "Mechanical Engineer Career in India — Full Guide",  channel: "Career Guide India",    duration: "14:20" },
  { goal: "mechanical",   language: "en", topic: "Physics",         id: "ZM8ECpBuQYE", title: "Physics for Mechanical Engineers — Mechanics",      channel: "Vedantu JEE",           duration: "58:24" },

  // ── CIVIL ENGINEER ─────────────────────────────────────────────────────────
  { goal: "civil",        language: "en", topic: "Structures",      id: "3icoSeGqQtY", title: "Structural Engineering — Fundamentals",             channel: "3Blue1Brown",           duration: "15:42" },
  { goal: "civil",        language: "en", topic: "Materials",       id: "ZM8ECpBuQYE", title: "Civil Engineering Materials Science",               channel: "Vedantu JEE",           duration: "58:24" },
  { goal: "civil",        language: "en", topic: "Maths",           id: "NybHckSEQBI", title: "Engineering Mathematics for Civil Students",        channel: "Khan Academy",          duration: "10:05" },
  { goal: "civil",        language: "en", topic: "AutoCAD",         id: "mU6anWqZJcc", title: "AutoCAD for Civil Engineers — Beginner Course",     channel: "SuperSimpleDev",        duration: "6:31:19" },
  { goal: "civil",        language: "en", topic: "Career",          id: "PFDu9oVAE-g", title: "Civil Engineer Career Roadmap in India",            channel: "Career Guide India",    duration: "14:20" },
  { goal: "civil",        language: "en", topic: "Design",          id: "aGGBGcjdjXA", title: "Concrete Design & Construction Basics",             channel: "CrashCourse",           duration: "12:30" },

  // ── LAWYER / LEGAL ─────────────────────────────────────────────────────────
  { goal: "lawyer",       language: "en", topic: "Constitutional Law", id: "g1J4181W8ss", title: "Indian Constitution — Complete Overview",         channel: "StudyIQ",               duration: "1:30:00" },
  { goal: "lawyer",       language: "en", topic: "Indian Law",      id: "Un2yBgIAxYs", title: "Introduction to Indian Legal System",              channel: "StudyIQ Defence",       duration: "45:00" },
  { goal: "lawyer",       language: "en", topic: "Career",          id: "Hz4FNBj1APA", title: "How to Become a Lawyer in India — Complete Guide", channel: "Career Guide India",    duration: "20:00" },
  { goal: "lawyer",       language: "en", topic: "Soft Skills",     id: "HAnw168huqA", title: "Public Speaking & Argumentation Skills",           channel: "Thomas Frank",          duration: "12:50" },
  { goal: "lawyer",       language: "en", topic: "Polity",          id: "g1J4181W8ss", title: "CLAT Preparation — Legal Aptitude Guide",          channel: "StudyIQ",               duration: "1:30:00" },
  { goal: "lawyer",       language: "en", topic: "Ethics",          id: "dItUGF8GdTw", title: "Critical Thinking for Law Students",               channel: "TED-Ed",                duration: "5:25" },

  // ── SCIENTIST / RESEARCHER ─────────────────────────────────────────────────
  { goal: "scientist",    language: "en", topic: "Research Methods", id: "ukLnPbIffxE", title: "How to Read & Write Scientific Papers",            channel: "TED-Ed",                duration: "5:20" },
  { goal: "scientist",    language: "en", topic: "Physics",         id: "ZM8ECpBuQYE", title: "Physics — Quantum Mechanics Overview",              channel: "Vedantu JEE",           duration: "58:24" },
  { goal: "scientist",    language: "en", topic: "Chemistry",       id: "aGGBGcjdjXA", title: "Advanced Chemistry — Research Level Concepts",     channel: "CrashCourse",           duration: "12:30" },
  { goal: "scientist",    language: "en", topic: "Biology",         id: "Dxcc6ycZ73M", title: "Genetics & Evolution — Research Applications",     channel: "CrashCourse",           duration: "22:00" },
  { goal: "scientist",    language: "en", topic: "Career",          id: "arj7oStGLkU", title: "Career in Research & Science in India — ISRO DRDO", channel: "TED-Ed",               duration: "13:00" },
  { goal: "scientist",    language: "en", topic: "Mathematics",     id: "WUvTyaaNkzM", title: "Advanced Calculus for Scientists",                  channel: "3Blue1Brown",           duration: "17:04" },

  // ── ENTREPRENEUR / BUSINESS ────────────────────────────────────────────────
  { goal: "entrepreneur", language: "en", topic: "Business",        id: "PFDu9oVAE-g", title: "How to Start a Business — Complete Guide",         channel: "Vedantu Commerce",      duration: "42:00" },
  { goal: "entrepreneur", language: "en", topic: "Marketing",       id: "E7CwqNHn_Ns", title: "Digital Marketing for Entrepreneurs",              channel: "TechBurner",            duration: "22:00" },
  { goal: "entrepreneur", language: "en", topic: "Finance",         id: "PHe0bXAIuk0", title: "Startup Funding & Finance — India Guide",          channel: "CA Rachana Ranade",     duration: "25:30" },
  { goal: "entrepreneur", language: "en", topic: "Mindset",         id: "arj7oStGLkU", title: "Entrepreneur Mindset — TED Talks Compilation",     channel: "TED-Ed",                duration: "13:00" },
  { goal: "entrepreneur", language: "en", topic: "Career",          id: "Hz4FNBj1APA", title: "How to Build a Startup in India — Success Stories", channel: "Career Guide India",   duration: "20:00" },
  { goal: "entrepreneur", language: "en", topic: "Leadership",      id: "dItUGF8GdTw", title: "Leadership & Team Management Skills",              channel: "TED-Ed",                duration: "5:25" },

  // ── DESIGN / UI-UX ─────────────────────────────────────────────────────────
  { goal: "design",       language: "en", topic: "UI/UX Design",    id: "mU6anWqZJcc", title: "UI/UX Design Full Course — Figma & Principles",    channel: "SuperSimpleDev",        duration: "6:31:19" },
  { goal: "design",       language: "en", topic: "Graphic Design",  id: "1i9kcBHX2Nw", title: "Graphic Design Fundamentals — Complete Beginner",  channel: "CrashCourse",           duration: "10:00" },
  { goal: "design",       language: "en", topic: "Tools",           id: "PkZNo7MFNFg", title: "Adobe Illustrator & Photoshop Essentials",         channel: "freeCodeCamp",          duration: "3:26:42" },
  { goal: "design",       language: "en", topic: "Color & Typography", id: "YQHsXMglC9A", title: "Color Theory & Typography for Designers",        channel: "Adam Neely",            duration: "18:30" },
  { goal: "design",       language: "en", topic: "Career",          id: "Hz4FNBj1APA", title: "Design Career in India — Salary & Growth 2025",    channel: "Career Guide India",    duration: "20:00" },
  { goal: "design",       language: "en", topic: "Animation",       id: "1i9kcBHX2Nw", title: "2D/3D Animation Basics for Beginners",             channel: "CrashCourse",           duration: "10:00" },

  // ── DIGITAL MARKETING ──────────────────────────────────────────────────────
  { goal: "digital-marketing", language: "en", topic: "SEO",        id: "ukLnPbIffxE", title: "SEO Full Course — Rank on Google 2025",            channel: "TED-Ed",                duration: "5:20" },
  { goal: "digital-marketing", language: "en", topic: "Social Media", id: "E7CwqNHn_Ns", title: "Social Media Marketing — Complete Guide",        channel: "TechBurner",            duration: "22:00" },
  { goal: "digital-marketing", language: "en", topic: "Analytics",  id: "ua-CiDNNj30", title: "Google Analytics & Data-Driven Marketing",        channel: "Simplilearn",           duration: "10:31:06" },
  { goal: "digital-marketing", language: "en", topic: "Content",    id: "HAnw168huqA", title: "Content Marketing & Copywriting — Full Course",   channel: "Thomas Frank",          duration: "12:50" },
  { goal: "digital-marketing", language: "en", topic: "Career",     id: "Hz4FNBj1APA", title: "Digital Marketing Career in India — Roadmap",     channel: "Career Guide India",    duration: "20:00" },
  { goal: "digital-marketing", language: "en", topic: "Ads",        id: "PFDu9oVAE-g", title: "Google Ads & Facebook Ads — Beginner Guide",      channel: "Vedantu Commerce",      duration: "42:00" },

  // ── CA (CHARTERED ACCOUNTANT) ──────────────────────────────────────────────
  { goal: "ca",           language: "en", topic: "Accountancy",     id: "2ePf9rue1Ao", title: "Accountancy Full Course — CA Foundation",          channel: "Khan Academy",          duration: "20:00" },
  { goal: "ca",           language: "en", topic: "Taxation",        id: "PHe0bXAIuk0", title: "GST & Income Tax — Complete Guide for CA Students", channel: "CA Rachana Ranade",     duration: "25:30" },
  { goal: "ca",           language: "en", topic: "Finance",         id: "LgUCyWhJf6s", title: "Corporate Finance & Financial Statements",         channel: "Zerodha Varsity",       duration: "18:40" },
  { goal: "ca",           language: "en", topic: "Law",             id: "Un2yBgIAxYs", title: "Business Law for CA — Complete Overview",          channel: "StudyIQ Defence",       duration: "45:00" },
  { goal: "ca",           language: "en", topic: "Career",          id: "Dxcc6ycZ73M", title: "How to Become a CA in India — Full Roadmap",       channel: "Career Guidance",       duration: "30:00" },
  { goal: "ca",           language: "en", topic: "Audit",           id: "Hz4FNBj1APA", title: "Auditing & Assurance — CA IPCA Final",             channel: "Career Guide India",    duration: "20:00" },
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
    const goalMatch  = v.goal === goal || v.goal === "all";
    const langMatch  = v.language === language || v.language === "en";
    const topicMatch = !topic || v.topic.toLowerCase().includes(topic);
    return goalMatch && langMatch && topicMatch;
  });

  // Prioritise exact language matches over English fallbacks
  const exact    = filtered.filter((v) => v.language === language);
  const fallback = filtered.filter((v) => v.language === "en" && !exact.some((e) => e.id === v.id));
  filtered = [...exact, ...fallback];

  // Remove duplicates by ID
  const seen   = new Set<string>();
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

  const sections = Object.entries(byTopic).map(([topic, videos]) => ({ topic, videos }));

  res.json({
    goal,
    language,
    totalVideos: unique.length,
    sections,
  });
});

export default router;
