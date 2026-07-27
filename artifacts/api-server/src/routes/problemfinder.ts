/**
 * POST /api/problem-finder
 * Returns real-world problems for a student to solve as a school project.
 * Falls back to a curated static list when AI is unavailable.
 */

import { Router, type IRouter } from "express";
import { callAI, parseAIJson } from "../lib/ai";

const router: IRouter = Router();

type Problem = {
  title:      string;
  emoji:      string;
  domain:     string;
  description:string;
  cause:      string;
  impact:     string;
  difficulty: "Easy" | "Medium" | "Hard";
  location:   string;
};

// ─── Static fallback problems by goal ────────────────────────────────────────

const STATIC_PROBLEMS: Record<string, Problem[]> = {
  engineering: [
    { title: "Pothole Detection Using Smartphone Sensors", emoji: "🛣️", domain: "Civil & IoT", description: "Roads in Indian cities have thousands of potholes that cause accidents and damage vehicles. Detecting them accurately is the first step to fixing them.", cause: "Poor road maintenance, heavy monsoon damage, and limited municipal budget allocation", impact: "Reducing road accidents, saving lives, and helping municipalities prioritise repairs", difficulty: "Medium", location: "Bangalore, Pune, Mumbai" },
    { title: "School Bus Route Optimiser", emoji: "🚌", domain: "Logistics & Algorithms", description: "School buses in India often take inefficient routes, wasting fuel and time. An algorithm-based route planner could save fuel and reduce student commute times.", cause: "Manual scheduling without data analysis, no real-time traffic integration", impact: "Reduces fuel cost by 20–30%, lowers carbon emissions, shortens commute for students", difficulty: "Medium", location: "All major Indian cities" },
    { title: "Rainwater Harvesting Monitor", emoji: "💧", domain: "Environmental Engineering", description: "Most rooftop rainwater harvesting systems in schools and homes have no monitoring. A simple IoT sensor can track how much water is collected vs wasted.", cause: "Lack of awareness and no measurement system to motivate behaviour change", impact: "Can save thousands of litres per household; addresses water scarcity in drought-prone areas", difficulty: "Easy", location: "Rajasthan, Chennai, Bengaluru" },
    { title: "Smart Helmet for Construction Workers", emoji: "⛑️", domain: "Safety Engineering", description: "Construction sites in India have high accident rates due to workers not wearing helmets. A smart helmet with a buzzer can alert supervisors when safety gear is removed.", cause: "Non-compliance with safety norms, no enforcement mechanism", impact: "Prevents head injuries and fatalities at construction sites", difficulty: "Hard", location: "Delhi NCR, Mumbai, Hyderabad" },
    { title: "Bridge Vibration Monitoring System", emoji: "🌉", domain: "Structural Engineering", description: "Many older bridges across India have no structural health monitoring. A low-cost vibration sensor system could detect early signs of structural weakness.", cause: "Aging infrastructure, limited budget for professional structural audits", impact: "Prevents bridge collapses, saves lives and infrastructure investment", difficulty: "Hard", location: "Rural bridges, Bihar, UP" },
    { title: "Low-Cost Water Quality Tester", emoji: "🧪", domain: "Environmental Engineering", description: "Millions of Indians drink contaminated water unknowingly. A ₹200 DIY water testing kit using basic chemistry can check for common contaminants.", cause: "Groundwater contamination from industrial waste and open defecation", impact: "Protects rural communities from waterborne diseases like typhoid and cholera", difficulty: "Easy", location: "Rural India, Jharkhand, UP" },
  ],
  medical: [
    { title: "Medication Reminder App for Elderly", emoji: "💊", domain: "Health Technology", description: "Elderly patients in India frequently miss medications because they live alone or have memory issues. A simple voice-based reminder app in Hindi can save lives.", cause: "Cognitive decline, lack of family support, language barriers with existing apps", impact: "Reduces hospitalisation due to missed doses; improves quality of life for 100M+ elderly Indians", difficulty: "Easy", location: "All of India — especially rural areas" },
    { title: "Malnutrition Detection via Photo Analysis", emoji: "📸", domain: "AI & Paediatric Health", description: "Severe malnutrition in children under 5 can be detected by measuring arm circumference. A phone app that uses photos to measure MUAC could help ASHA workers in remote areas.", cause: "Lack of trained healthcare workers and equipment in rural health centres", impact: "Early detection prevents stunting and child mortality in high-burden states", difficulty: "Hard", location: "Jharkhand, Bihar, Madhya Pradesh" },
    { title: "Menstrual Health Tracker for Rural Girls", emoji: "📅", domain: "Women's Health", description: "Teenage girls in rural India have limited access to health education. A simple offline mobile app tracking menstrual cycles and providing health tips in local languages can improve health awareness.", cause: "Lack of sanitation education and taboo around menstrual health discussions", impact: "Improves school attendance, reduces anaemia risk, empowers adolescent girls", difficulty: "Easy", location: "Rural Rajasthan, Bihar, UP" },
    { title: "Dengue Mosquito Breeding Site Mapper", emoji: "🦟", domain: "Epidemiology & GIS", description: "Dengue spreads rapidly in urban India through stagnant water breeding sites. A community mapping app lets citizens report and track breeding sites to help municipalities.", cause: "Rapid urbanisation, poor drainage systems, uncovered water containers", impact: "Reduces dengue incidence; has potential to prevent thousands of cases yearly in endemic cities", difficulty: "Medium", location: "Delhi, Chennai, Kerala, Karnataka" },
    { title: "Mental Health Screening Tool for Teens", emoji: "🧠", domain: "Mental Health & Technology", description: "India has very few psychiatrists per 1 lakh people. A validated self-screening quiz for anxiety and depression can help teenagers identify when to seek help.", cause: "Stigma, lack of awareness, and unavailability of mental health professionals", impact: "Early identification reduces suicide risk and improves mental wellbeing of 250M+ adolescents", difficulty: "Medium", location: "Urban India — particularly academic pressure zones" },
    { title: "Affordable Hearing Test Kit", emoji: "👂", domain: "Assistive Technology", description: "Over 63 million Indians have significant hearing loss. A smartphone-based hearing test app can screen patients in community health centres before expensive audiometry.", cause: "Cost and unavailability of audiologists in tier-2 and tier-3 cities", impact: "Early detection allows for hearing aid fitting and language development in children", difficulty: "Medium", location: "Rural India, tribal districts" },
  ],
  it: [
    { title: "Fake News Detector for WhatsApp Forwards", emoji: "🔍", domain: "NLP & Fact-Checking", description: "WhatsApp misinformation is a major problem in India, causing panic and communal tension. A browser plugin or chatbot that cross-references viral text with fact-check databases could help.", cause: "Low digital literacy, language barriers, and social pressure to forward messages", impact: "Reduces spread of health misinformation, election disinformation, and communal fake news", difficulty: "Hard", location: "India-wide — all social media users" },
    { title: "Crop Disease Identifier Using Phone Camera", emoji: "🌾", domain: "Computer Vision & Agriculture", description: "Indian farmers lose 20–30% of crops to diseases they can't identify. A phone app that photographs leaves and identifies disease type can save harvests.", cause: "Lack of access to agricultural experts and high cost of consultations", impact: "Prevents crop loss for 120M+ farmer families; improves food security", difficulty: "Hard", location: "Andhra Pradesh, Punjab, Maharashtra" },
    { title: "Local Transport Tracker for Small Towns", emoji: "🚌", domain: "Mobile App & GPS", description: "Unlike big cities, small-town bus services in India have no apps or GPS. A volunteer-built real-time tracker using WhatsApp location sharing can help millions.", cause: "No budget for official infrastructure; government buses don't have GPS systems", impact: "Saves 20–30 minutes per day for millions of small-town commuters", difficulty: "Medium", location: "Tier-2/3 cities across India" },
    { title: "Digital Attendance with Face Recognition", emoji: "📱", domain: "Computer Vision & School Tech", description: "School attendance in India is still paper-based and prone to manipulation. A low-cost face recognition system using a Raspberry Pi can automate attendance.", cause: "Manual record-keeping, proxy attendance fraud, no digital audit trail", impact: "Reduces truancy, saves teacher time, improves accountability in government schools", difficulty: "Hard", location: "Government schools, rural India" },
    { title: "Offline Exam Preparation Chatbot", emoji: "🤖", domain: "AI & EdTech", description: "Students in areas with poor internet connectivity cannot access online learning resources. An offline AI chatbot loaded on a local device can answer JEE/NEET questions.", cause: "Digital divide — 40% of India still has unreliable internet access", impact: "Democratises quality education for students in remote areas", difficulty: "Hard", location: "Rural Bihar, UP, Northeast India" },
    { title: "E-Waste Collection App", emoji: "♻️", domain: "Environmental Tech & Community", description: "India generates 3.2 million tonnes of e-waste annually, most of which ends up in landfills. An app connecting households with certified e-waste collectors can solve this.", cause: "Lack of awareness about e-waste hazards and no convenient collection mechanism", impact: "Reduces toxic waste in landfills; creates livelihood for informal collectors", difficulty: "Easy", location: "Delhi, Bangalore, Mumbai" },
  ],
  default: [
    { title: "Village Library Digitisation Project", emoji: "📚", domain: "Education & Technology", description: "Thousands of rural libraries in India have books that are deteriorating with no digital backup. A student-led project to scan and upload books can preserve local knowledge.", cause: "Limited funding, no digital infrastructure in rural areas", impact: "Preserves cultural knowledge and improves access to education for rural students", difficulty: "Easy", location: "Rural India" },
    { title: "Rooftop Solar Potential Calculator", emoji: "☀️", domain: "Renewable Energy", description: "Many Indian homes and schools could install rooftop solar but don't know their energy potential. A calculator using roof area and location data can guide decisions.", cause: "Lack of easy-to-use tools for energy planning", impact: "Could accelerate solar adoption in 30M+ Indian households", difficulty: "Medium", location: "All of India" },
    { title: "Plastic-Free Campus Initiative Tracker", emoji: "🌿", domain: "Environmental Science", description: "Schools and colleges pledge to go plastic-free but have no system to track progress. A simple scoring system and audit tool can make pledges measurable.", cause: "Good intentions without measurement or accountability mechanisms", impact: "Reduces single-use plastic in educational institutions across India", difficulty: "Easy", location: "Schools and colleges nationwide" },
    { title: "Street Dog Vaccination Tracker", emoji: "🐕", domain: "Animal Welfare & Health", description: "India has over 30 million street dogs, many unvaccinated for rabies. A crowdsourced app tracking which dogs are vaccinated (with ear tags) can help municipalities plan drives.", cause: "No centralised tracking of street dog health; poor inter-department coordination", impact: "Reduces 20,000+ annual human deaths from rabies; improves animal welfare", difficulty: "Medium", location: "Urban India" },
    { title: "Braille Book Creator for Blind Students", emoji: "👁️", domain: "Assistive Technology & Social Work", description: "India has 8 million visually impaired people with very limited access to Braille textbooks. A low-cost Braille embosser design can be 3D-printed for ₹5,000.", cause: "High cost of commercial Braille books; limited production capacity", impact: "Transforms access to education for blind children in India", difficulty: "Hard", location: "Schools for the blind across India" },
    { title: "Flood Early Warning System for Villages", emoji: "🌊", domain: "Disaster Management & IoT", description: "River villages in India are often the last to receive flood warnings. A cheap water level sensor and SMS alert system can give 6–8 hours of advance warning.", cause: "No last-mile communication for government flood alerts; villages have no sensors", impact: "Saves lives and property in flood-prone states during monsoon season", difficulty: "Hard", location: "Bihar, Assam, Kerala, Odisha" },
  ],
};

router.post("/problem-finder", async (req, res) => {
  const { goal, region, classStandard } = req.body as Record<string, unknown>;

  const safeGoal   = String(goal   ?? "Science").slice(0, 50);
  const safeRegion = String(region ?? "India").slice(0, 80);
  const safeClass  = String(classStandard ?? "9").slice(0, 10);

  const prompt = `You are an expert project mentor for Indian school students (Class ${safeClass}).
Generate exactly 6 real-world problems relevant to the field of "${safeGoal}" that a student in ${safeRegion}, India can solve as a school project.

Return ONLY a valid JSON array — no markdown, no explanation, no extra text. Use this exact structure:
[
  {
    "title": "short problem title (max 10 words)",
    "emoji": "one relevant emoji",
    "domain": "specific sub-field (e.g. Robotics, Nutrition, Finance)",
    "description": "2-3 sentences explaining the problem clearly",
    "cause": "the main root cause of this problem",
    "impact": "why solving this matters for the community",
    "difficulty": "Easy",
    "location": "specific region/city/state in India where this is common"
  }
]
Make difficulty one of: Easy, Medium, Hard. Make problems realistic, local, and solvable by school students.`;

  const raw = await callAI(prompt, 2000);

  if (raw) {
    // Try to extract JSON array robustly
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const problems = JSON.parse(match[0]) as Problem[];
        if (Array.isArray(problems) && problems.length > 0) {
          res.json({ problems, goal: safeGoal, region: safeRegion });
          return;
        }
      } catch { /* fall through to static */ }
    }
    // Try parseAIJson as object wrapper
    const parsed = parseAIJson<{ problems: Problem[] }>(raw);
    if (parsed?.problems?.length) {
      res.json({ problems: parsed.problems, goal: safeGoal, region: safeRegion });
      return;
    }
  }

  // Static fallback
  const goalKey = Object.keys(STATIC_PROBLEMS).find((k) =>
    safeGoal.toLowerCase().includes(k) || k.includes(safeGoal.toLowerCase())
  ) ?? "default";

  const problems = STATIC_PROBLEMS[goalKey] ?? STATIC_PROBLEMS.default!;
  res.json({ problems, goal: safeGoal, region: safeRegion });
});

export default router;
