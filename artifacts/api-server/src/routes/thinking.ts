/**
 * POST /api/thinking
 * Analyses how a great thinker thought — their philosophy, mental models, and mindset.
 * Falls back to curated static profiles for the most popular people when AI is unavailable.
 */

import { Router, type IRouter } from "express";
import { callAI } from "../lib/ai";

const router: IRouter = Router();

// ─── Static profiles for the most-requested people ───────────────────────────

const STATIC_PROFILES: Record<string, string> = {
  "apj abdul kalam": `## 🧠 Profile Summary
**Dr. APJ Abdul Kalam** (1931–2015) was India's 11th President and one of the world's most celebrated aerospace scientists. Born in Rameswaram, Tamil Nadu, into a humble family, he rose to lead India's missile and space programmes, earning the title "Missile Man of India." He was awarded the Bharat Ratna in 1997.

## 💡 Core Thinking Pattern
Kalam thought like a **dreamer who acted like an engineer**. He combined visionary idealism with rigorous scientific discipline. His signature mental framework was DREAM → THINK → ACT: he believed every achievement begins with a dream, is shaped by sustained thinking, and becomes real through persistent action. He was famous for his **systems thinking** — understanding how every component of a rocket, like every person in society, has a role to play.

## 🔬 Problem-Solving Style
Kalam approached problems through **first principles and relentless iteration**. When India's first satellite launch vehicle (SLV-3) failed in 1979, he took full personal responsibility and analysed each component's failure point. Within two years, SLV-3 successfully deployed the Rohini satellite. He believed failure was data, not defeat. His AGNI and PRITHVI missile programmes succeeded through thousands of small failures that taught him what not to do.

## 🌍 Philosophy & Worldview
Kalam believed **India's greatness lay in its youth**. His philosophy was rooted in three pillars: *hard work*, *integrity*, and *vision*. He was deeply spiritual but secular — he read the Quran, the Bhagavad Gita, and the Bible. He believed that science and spirituality were two sides of the same coin. His vision for "India 2020" — a developed nation — drove everything he did.

## ⚡ Emotional Intelligence & Leadership
Kalam was known for his **extraordinary humility**. Despite being president, he insisted on being called "Kalam" by students. He handled criticism by listening carefully and responding with facts. He was moved by the plight of rural India — after becoming President, he spent enormous time visiting villages. He inspired through **storytelling** — his speeches were full of his own childhood struggles.

## 🚀 Innovation & Creativity Style
Kalam was an **interdisciplinary connector**. He linked aerospace technology to healthcare (lightweight orthopaedic devices), agriculture (precision irrigation sensors), and education (PURA — Providing Urban Amenities in Rural Areas). His most innovative idea was that technology should serve the poorest first. He co-authored 5 books, worked with young inventors, and mentored thousands of students.

## 📚 What Students Can Learn
- **Dream big without embarrassment** — Kalam's dreams seemed impossible to others but he never stopped believing
- **Failure is a teacher** — Document what went wrong, fix it, and try again; don't give up after one failure
- **Read voraciously** — Kalam read constantly across science, literature, and spirituality; knowledge has no boundaries
- **Work harder than anyone else in the room** — He slept 4 hours a night and worked 20-hour days for decades
- **Mentor and be mentored** — Kalam had great mentors (Vikram Sarabhai) and became a great mentor himself
- **Stay humble with success** — True greatness never needs to announce itself
- **Connect technology to human needs** — Ask "who does this help?" before asking "how does this work?"

## 🌟 Famous Quotes & Their Meaning
**"Dream, Dream, Dream. Dreams transform into thoughts and thoughts result in action."**
This quote encapsulates Kalam's entire philosophy. He believed inaction was the enemy of progress. A dream without a plan is a wish — but a dream backed by daily effort becomes reality.

**"You have to dream before your dreams can come true."**
Many students wait to be "ready" before pursuing their ambitions. Kalam says the dream must come first — it pulls you forward and gives you the courage to begin.

**"Don't take rest after your first victory because if you fail in second, more lips are waiting to say that your first victory was just luck."**
This is a powerful warning against complacency. Excellence is a habit, not a one-time event. Consistent performance builds a reputation that no one can dismiss.`,

  "albert einstein": `## 🧠 Profile Summary
**Albert Einstein** (1879–1955) was a German-born theoretical physicist who developed the theory of relativity — one of the two pillars of modern physics (alongside quantum mechanics). His famous equation E=mc² transformed our understanding of energy and matter. He won the Nobel Prize in Physics in 1921 for his discovery of the photoelectric effect. Born in Ulm, Germany, he struggled in conventional schooling but revolutionised science through imaginative thinking.

## 💡 Core Thinking Pattern
Einstein was the master of the **thought experiment (Gedankenexperiment)**. He didn't primarily work with data in a lab — he imagined scenarios in his mind and followed them to their logical conclusions. His most famous thought experiment: "What would I see if I rode alongside a beam of light?" This question, which he first asked at age 16, eventually led to Special Relativity. His mental framework was **imagination + mathematical rigour** — he believed imagination was more important than knowledge.

## 🔬 Problem-Solving Style
Einstein believed in working from **simple, elegant principles** rather than complicated equations. When solving a problem, he would first state the simplest possible version of it, then generalise. He was famous for sitting quietly and thinking for hours — he called this "combinatory play." He combined visual thinking with abstract mathematics uniquely. When developing General Relativity, he spent 10 years wrestling with the geometry of curved space-time.

## 🌍 Philosophy & Worldview
Einstein believed in **Spinoza's God** — the rational order and beauty of nature, not a personal God. He was a **pacifist and humanist**. He opposed nationalism and war, famously saying "Nationalism is an infantile disease — the measles of mankind." He believed the universe was fundamentally comprehensible to human reason and that physics should reveal its deepest symmetries.

## ⚡ Emotional Intelligence & Leadership
Einstein was **deeply uncomfortable with fame** but used his platform for humanitarian causes. He signed letters warning about nuclear weapons. He was generous with students who wrote to him. He handled failure philosophically — spending years on a failed "unified field theory" without abandoning his search. His resilience came from his absolute belief in the rationality of nature.

## 🚀 Innovation & Creativity Style
Einstein's creativity came from **connecting distant domains** — thermodynamics to Brownian motion, electromagnetism to mechanics. He played violin and said music helped him think. His breakthrough insights often came during walks or while playing music — not at his desk. He believed **relaxation and play were prerequisites for deep creative work**.

## 📚 What Students Can Learn
- **Ask "what if?" questions** — Einstein's best work started with simple imaginative questions
- **Understand deeply, don't memorise** — He kept equations to a minimum; understanding the concept matters more
- **Embrace being different** — Einstein was considered a slow learner; his unconventional thinking became his superpower
- **Sit with hard problems** — Don't give up after an hour; some questions need years of patient thinking
- **Play and rest are part of thinking** — Creative breakthroughs come when you relax, not when you force them
- **Be humble** — Einstein said "The more I learn, the more I realise how much I don't know"
- **Use your platform for good** — Fame is a megaphone; use it for things that matter

## 🌟 Famous Quotes & Their Meaning
**"Imagination is more important than knowledge. Knowledge is limited; imagination encircles the world."**
Einstein used this to argue that creative thinking creates the new frameworks that knowledge then fills in. In school, students are rewarded for what they know — but the world rewards those who imagine what isn't yet known.

**"Logic will get you from A to B. Imagination will take you everywhere."**
This is Einstein's case for unconventional thinking. Following rules gets you to expected places. Imagination breaks you free from the expected path.

**"The definition of insanity is doing the same thing over and over and expecting different results."**
Einstein understood that breakthrough requires changing your approach. When students get the same exam score repeatedly, they need to change their study method — not just work harder with the same approach.`,

  "steve jobs": `## 🧠 Profile Summary
**Steve Jobs** (1955–2011) was the co-founder of Apple Inc., Pixar Animation Studios, and NeXT. He is widely considered the greatest product visionary in technology history. Born in San Francisco and adopted by working-class parents, he dropped out of Reed College but audited calligraphy classes — a decision that led to the beautiful typography on the first Macintosh. He was both celebrated for revolutionising personal computing, music, phones, and animated films, and criticised for his intense, sometimes brutal management style.

## 💡 Core Thinking Pattern
Jobs thought at the **intersection of technology and the liberal arts**. He believed technology was only valuable when made beautiful, simple, and human. His signature mental framework was **"focus by subtraction"** — he would eliminate every unnecessary feature, option, and product until only the essential remained. When he returned to Apple in 1997, he cut the product line from 350 to 10 products. Simplicity was his obsession.

## 🔬 Problem-Solving Style
Jobs used **reverse engineering from the user experience**. He started with: "What does the user feel?" and worked backward to the technology. When designing the iPod, he insisted on "1,000 songs in your pocket" as the defining experience — and the engineering team had to figure out how to make that real. He was famous for his **reality distortion field** — convincing teams to do things they believed were impossible.

## 🌍 Philosophy & Worldview
Jobs was deeply influenced by **Zen Buddhism**, particularly ideas of simplicity, impermanence, and being fully present. He had a binary view of the world — things were either "insanely great" or "total crap." He believed that **great products change culture** — Apple products weren't just devices, they were tools for creative expression. He saw himself as standing at the crossroads of "technology and the humanities."

## ⚡ Emotional Intelligence & Leadership
Jobs was notoriously **demanding, impatient, and sometimes cruel** — but he inspired extraordinary work. He would reject prototypes dozens of times until they were perfect. He handled setbacks dramatically: when fired from Apple in 1985, he founded NeXT and Pixar, later returning stronger. His emotional intelligence grew as he aged — his commencement speech at Stanford (2005) showed remarkable wisdom about facing death.

## 🚀 Innovation & Creativity Style
Jobs innovated through **curation and synthesis**, not invention. He didn't invent the MP3 player, smartphone, or tablet — he made the best versions of each by combining existing ideas brilliantly. He was a master of **narrative product launches** — turning product announcements into cultural events. His creativity was fuelled by wide reading, travel to India, calligraphy, and a relentless dissatisfaction with mediocrity.

## 📚 What Students Can Learn
- **Stay focused on what matters** — Cut everything else ruthlessly; depth beats breadth
- **Connect different fields** — Jobs combined technology with calligraphy, music, and Zen; cross-disciplinary thinking creates breakthroughs
- **Care obsessively about quality** — The parts users never see should still be perfect
- **Think in stories** — Jobs communicated in narratives, not feature lists; learn to tell compelling stories
- **Embrace failure as a reset** — Getting fired from Apple was the best thing that happened to him
- **Hire people smarter than you** — Jobs surrounded himself with A-players who challenged him
- **Design for emotion first** — Ask "how will this make the user feel?" before asking "how does this work?"

## 🌟 Famous Quotes & Their Meaning
**"Stay hungry. Stay foolish."**
Jobs told Stanford graduates never to become complacent or too sophisticated to keep learning. Hunger drives action; foolishness allows you to take risks that wiser people won't.

**"Your time is limited, so don't waste it living someone else's life."**
Jobs was diagnosed with cancer and became deeply aware of mortality. This quote is his reminder that external expectations — parents, peers, society — shouldn't define your path.

**"The people who are crazy enough to think they can change the world are the ones who do."**
This is Jobs's argument for bold ambition. The world's most important changes were made by people who ignored everyone who said it was impossible.`,
};

function findStaticProfile(name: string): string | null {
  const lower = name.toLowerCase().trim();
  for (const [key, profile] of Object.entries(STATIC_PROFILES)) {
    if (lower.includes(key) || key.includes(lower)) return profile;
    // Partial match — last name
    const keyParts = key.split(" ");
    if (keyParts.some((part) => part.length > 3 && lower.includes(part))) return profile;
  }
  return null;
}

// ─── Route ──────────────────────────────────────────────────────────────────

router.post("/thinking", async (req, res) => {
  const { personName, language } = req.body as Record<string, unknown>;

  if (!personName || typeof personName !== "string" || personName.trim().length < 2) {
    res.status(400).json({ error: "Please enter a valid person's name." });
    return;
  }

  const name = personName.trim().slice(0, 100);

  const ALLOWED_LANGUAGES = [
    "English", "Hindi", "Kannada", "Tamil", "Telugu",
    "Marathi", "Bengali", "Gujarati", "Punjabi", "Malayalam",
  ];
  const lang =
    typeof language === "string" && ALLOWED_LANGUAGES.includes(language)
      ? language
      : "English";

  const langInstruction =
    lang === "English"
      ? ""
      : `\n\nCRITICAL LANGUAGE REQUIREMENT: You MUST write your ENTIRE response in ${lang}. Every word — all section headings, descriptions, bullet points, quotes, and explanations — must be in ${lang}. Do NOT mix in English except for the person's name and any direct quotes. This is non-negotiable.\n`;

  const prompt = `You are an expert educational analyst and biographer specializing in the cognitive patterns and philosophies of great thinkers. A student has asked: "How did ${name} think?"${langInstruction}

Your task: Generate a deeply researched, student-friendly analysis of ${name}'s thinking patterns, philosophy, and mindset.

IMPORTANT:
- If "${name}" is not a real, well-known historical figure, scientist, leader, artist, or philosopher, respond with exactly: NOT_FOUND
- If the name is misspelled but recognizable (e.g. "Einstien" → Einstein), analyse the correct person and note the correction at the top.

If the person IS known, generate a structured analysis with ALL of the following sections in order. Use Markdown formatting — use ## for section headings, **bold** for key terms, and bullet points where appropriate. Write at least 150 words per section.

## 🧠 Profile Summary
## 💡 Core Thinking Pattern
## 🔬 Problem-Solving Style
## 🌍 Philosophy & Worldview
## ⚡ Emotional Intelligence & Leadership
## 🚀 Innovation & Creativity Style
## 📚 What Students Can Learn
## 🌟 Famous Quotes & Their Meaning

Write with warmth, depth, and precision for students aged 12–18.${lang !== "English" ? `\n\nRemember: Write everything in ${lang}.` : ""}`;

  const raw = await callAI(prompt, 4096);

  if (raw) {
    if (raw.trim().startsWith("NOT_FOUND")) {
      res.status(404).json({
        error: `We couldn't find reliable information about "${name}". Please check the spelling or try a well-known historical figure, scientist, leader, or philosopher.`,
      });
      return;
    }
    res.json({ personName: name, analysis: raw.trim(), language: lang });
    return;
  }

  // Static fallback — only for English (translation not available offline)
  if (lang === "English") {
    const staticProfile = findStaticProfile(name);
    if (staticProfile) {
      res.json({ personName: name, analysis: staticProfile, language: lang });
      return;
    }
  }

  res.status(503).json({
    error: "AI service is temporarily unavailable. Please try again later, or check that your Gemini API quota is not exceeded.",
  });
});

export default router;
