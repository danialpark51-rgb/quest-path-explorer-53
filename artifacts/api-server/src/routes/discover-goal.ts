/**
 * POST /api/discover-goal
 * Analyses a student's free-form self-description and returns AI-powered
 * career goal recommendations with detailed roadmaps.
 */

import { Router, type IRouter } from "express";
import { callAI, parseAIJson } from "../lib/ai";

const router: IRouter = Router();

interface GoalRecommendation {
  goalName: string;
  emoji: string;
  whyItMatches: string;
  requiredSkills: string[];
  futureScope: string;
  learningRoadmap: string[];
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  salaryPotential: string;
  recommendedSubjects: string[];
  matchScore: number; // 0-100
}

interface DiscoverGoalResponse {
  personalityProfile: {
    type: string;
    description: string;
    strengths: string[];
    learningPattern: string;
  };
  topRecommendations: GoalRecommendation[]; // exactly 4
  exploreMore: {
    goalName: string;
    emoji: string;
    matchPercentage: number;
    description: string;
    requiredSkills: string[];
    futureOpportunities: string[];
  }[];
}

router.post("/discover-goal", async (req, res) => {
  const { interests, classStandard, name } = req.body as {
    interests?: string;
    classStandard?: string;
    name?: string;
  };

  if (!interests || typeof interests !== "string" || interests.trim().length < 20) {
    res.status(400).json({
      error: "Please describe your interests in at least 20 characters so we can give you accurate recommendations.",
    });
    return;
  }

  const safeInterests = interests.trim().slice(0, 2000);
  const studentClass = classStandard ? `Class ${classStandard}` : "school";
  const studentName  = name ? name.trim().slice(0, 50) : "the student";

  const prompt = `You are an expert career counsellor and educational psychologist specialising in Indian students (Classes 5–12).

A ${studentClass} student named ${studentName} has written the following about themselves:
"${safeInterests}"

Analyse this deeply and return a comprehensive career guidance report in the following JSON format. 
IMPORTANT: Return ONLY valid JSON — no markdown, no code fences, no extra text.

{
  "personalityProfile": {
    "type": "e.g. Creative Problem-Solver / Analytical Thinker / Empathetic Leader",
    "description": "2-3 sentence personality summary based on what they wrote",
    "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
    "learningPattern": "e.g. Visual learner who thrives with hands-on projects"
  },
  "topRecommendations": [
    {
      "goalName": "e.g. Engineering & Technology",
      "emoji": "⚙️",
      "whyItMatches": "Specific explanation referencing what the student wrote (2-3 sentences)",
      "requiredSkills": ["Maths", "Physics", "Programming", "Problem-solving"],
      "futureScope": "Detailed paragraph about career opportunities, job market, growth",
      "learningRoadmap": [
        "Step 1: Focus on Class 9-10 Maths and Science",
        "Step 2: Learn Python basics",
        "Step 3: Prepare for JEE/competitive exams",
        "Step 4: Pursue B.Tech or Diploma",
        "Step 5: Specialise in your chosen domain"
      ],
      "difficultyLevel": "Intermediate",
      "salaryPotential": "₹4-40 LPA depending on specialisation and experience",
      "recommendedSubjects": ["Mathematics", "Physics", "Computer Science"],
      "matchScore": 92
    }
  ],
  "exploreMore": [
    {
      "goalName": "e.g. Arts & Design",
      "emoji": "🎨",
      "matchPercentage": 75,
      "description": "2-sentence description of this career path",
      "requiredSkills": ["Creativity", "Drawing", "Design thinking"],
      "futureOpportunities": ["Graphic Designer", "UI/UX Designer", "Film Director"]
    }
  ]
}

Rules:
- topRecommendations must contain EXACTLY 4 items, ranked by match quality
- exploreMore must contain 4-6 additional options with lower match scores
- Match scores in topRecommendations should be 75-98; exploreMore should be 45-74
- All recommendations must be realistic for Indian students
- Career goals should be from: Engineering & Technology, Medical & Healthcare, Arts & Design, Commerce & Business, Information Technology, Defence & Armed Forces, Government Services, Science & Research, Law & Justice, Education & Teaching, Agriculture & Environment, Architecture & Civil, Media & Journalism, Sports & Fitness, Psychology & Counselling, Social Work & NGO
- Be specific about Indian context: CBSE/state boards, JEE, NEET, UPSC, CAT, GATE etc.
- Salary figures should be in INR (₹)`;

  const raw = await callAI(prompt, 3000);
  const parsed = raw ? parseAIJson<DiscoverGoalResponse>(raw) : null;

  if (parsed && parsed.topRecommendations && parsed.topRecommendations.length > 0) {
    res.json(parsed);
    return;
  }

  // ─── Static fallback — generic but useful recommendations ─────────────────
  // (shown when all AI providers are unavailable or quota-exceeded)
  const lowerInterests = safeInterests.toLowerCase();

  const isTech    = /code|program|software|computer|tech|game|app|web|hack|robot/i.test(safeInterests);
  const isMedical = /doctor|medical|biology|health|nurse|medicine|neet|hospital/i.test(safeInterests);
  const isArts    = /art|draw|paint|design|music|dance|film|write|creat/i.test(safeInterests);
  const isCommerce = /business|finance|money|trade|market|account|commerce/i.test(safeInterests);
  const isScience = /science|physics|chemistry|research|space|isro|astronaut/i.test(safeInterests);

  void lowerInterests;

  const recommendations: GoalRecommendation[] = isTech ? [
    {
      goalName: "Information Technology & Software Engineering",
      emoji: "💻",
      whyItMatches: "Your interest in coding, technology, and problem-solving aligns perfectly with IT. Software engineers are India's highest-paid professionals.",
      requiredSkills: ["Programming (Python/Java)", "Logic & Algorithms", "Problem Solving", "Mathematics"],
      futureScope: "India's tech sector employs 5+ million engineers. Demand for AI, cloud, and full-stack developers is at an all-time high with salaries starting ₹6–8 LPA.",
      learningRoadmap: ["Master Class 11-12 Maths and Computer Science", "Learn Python and basic algorithms", "Prepare for JEE or BITSAT", "Pursue B.Tech in CS/IT from top college", "Build real projects on GitHub"],
      difficultyLevel: "Intermediate",
      salaryPotential: "₹6–60 LPA depending on company and role",
      recommendedSubjects: ["Computer Science", "Mathematics", "Physics"],
      matchScore: 94,
    },
    {
      goalName: "Artificial Intelligence & Data Science",
      emoji: "🤖",
      whyItMatches: "AI and data science are the hottest fields in technology right now. Students with maths and coding interest are perfectly suited for this emerging career.",
      requiredSkills: ["Python", "Statistics & Probability", "Linear Algebra", "Machine Learning basics"],
      futureScope: "AI engineers earn ₹15–100 LPA. India is investing heavily in AI with IIT AI centres and government AI missions creating thousands of high-paying jobs.",
      learningRoadmap: ["Build strong Maths foundation (Class 11-12)", "Learn Python and NumPy/Pandas", "Study statistics and probability", "Take free ML courses (Coursera/fast.ai)", "Pursue B.Tech CS with AI specialisation"],
      difficultyLevel: "Advanced",
      salaryPotential: "₹12–100+ LPA",
      recommendedSubjects: ["Mathematics", "Computer Science", "Statistics"],
      matchScore: 89,
    },
    {
      goalName: "Electronics & Communication Engineering",
      emoji: "⚡",
      whyItMatches: "If you love how things work — from smartphones to satellites — ECE combines hardware and software in exciting ways.",
      requiredSkills: ["Physics", "Mathematics", "Circuit Theory", "Signal Processing"],
      futureScope: "ECE graduates work at ISRO, Intel, Qualcomm, and telecom companies. 5G rollout and semiconductor push are creating 100,000+ jobs in India.",
      learningRoadmap: ["Focus on Physics and Maths in Class 11-12", "Target JEE Main/Advanced", "Study ECE at NIT/IIT/BITS", "Specialise in VLSI, embedded systems, or communications"],
      difficultyLevel: "Advanced",
      salaryPotential: "₹5–40 LPA",
      recommendedSubjects: ["Physics", "Mathematics", "Computer Science"],
      matchScore: 82,
    },
    {
      goalName: "Entrepreneurship & Technology Business",
      emoji: "🚀",
      whyItMatches: "India's startup ecosystem is booming — Bangalore, Hyderabad, and Delhi are minting tech unicorns. Your tech interest combined with business sense can build the next big thing.",
      requiredSkills: ["Problem identification", "Basic coding", "Business fundamentals", "Communication"],
      futureScope: "India has 100+ unicorn startups. Tech entrepreneurs can build scalable businesses with low capital. Many successful founders started in school.",
      learningRoadmap: ["Build side projects and apps from Class 11", "Participate in hackathons and startup competitions", "Learn about business models and markets", "Join startup incubators and accelerators after college"],
      difficultyLevel: "Intermediate",
      salaryPotential: "₹0 to unlimited — depends on your startup",
      recommendedSubjects: ["Computer Science", "Economics", "Mathematics"],
      matchScore: 78,
    },
  ] : isMedical ? [
    {
      goalName: "Medical Doctor (MBBS & MD)",
      emoji: "🏥",
      whyItMatches: "Your interest in health and biology makes you a natural fit for medicine — India's most respected profession.",
      requiredSkills: ["Biology", "Chemistry", "Empathy", "Analytical thinking", "Patience"],
      futureScope: "India needs 1 million more doctors. MBBS graduates can specialize, research, or practice globally. Government doctors earn ₹1–2 LPA starting; private specialists earn ₹20–100 LPA.",
      learningRoadmap: ["Excel in Class 11-12 Biology and Chemistry", "Crack NEET UG exam", "Complete MBBS (5.5 years)", "Clear NEET PG for MD/MS specialisation", "Pursue fellowship for super-specialisation"],
      difficultyLevel: "Advanced",
      salaryPotential: "₹8–100+ LPA (specialists)",
      recommendedSubjects: ["Biology", "Chemistry", "Physics"],
      matchScore: 95,
    },
    {
      goalName: "Biomedical Research & Pharmacology",
      emoji: "🔬",
      whyItMatches: "If you love science and want to discover new medicines or therapies, biomedical research is where breakthroughs happen.",
      requiredSkills: ["Biology", "Chemistry", "Lab techniques", "Critical thinking", "Research methodology"],
      futureScope: "India's biotech industry is worth $80 billion and growing. Pharma companies, CSIR labs, and international research institutes hire biomedical scientists.",
      learningRoadmap: ["Master Biology and Chemistry in Class 11-12", "Qualify NEET or JEE for admission", "Pursue BSc Biotech/Pharmacology or MBBS", "Pursue PhD at TIFR/CSIR/IISc"],
      difficultyLevel: "Advanced",
      salaryPotential: "₹5–30 LPA (academia); ₹10–50 LPA (industry)",
      recommendedSubjects: ["Biology", "Chemistry", "Mathematics"],
      matchScore: 88,
    },
    {
      goalName: "Dentistry (BDS)",
      emoji: "🦷",
      whyItMatches: "BDS offers a high-quality medical career with lower NEET cutoff than MBBS and excellent scope for private practice.",
      requiredSkills: ["Biology", "Chemistry", "Manual dexterity", "Patient care", "Attention to detail"],
      futureScope: "India's dental care market is growing rapidly. Private dental clinics earn ₹5–20 LPA. Orthodontists and implant specialists earn significantly more.",
      learningRoadmap: ["Study Biology and Chemistry rigorously", "Crack NEET UG (lower cutoff than MBBS)", "Complete BDS (5 years)", "Practice independently or join hospital"],
      difficultyLevel: "Intermediate",
      salaryPotential: "₹4–20 LPA",
      recommendedSubjects: ["Biology", "Chemistry", "Physics"],
      matchScore: 82,
    },
    {
      goalName: "Nursing & Healthcare Management",
      emoji: "💊",
      whyItMatches: "Nursing is a highly respected healthcare career with global opportunities. Healthcare managers run hospitals and health systems.",
      requiredSkills: ["Biology", "Compassion", "Communication", "Quick decision-making"],
      futureScope: "Indian nurses are in high demand in Gulf, UK, Canada, and Australia. Healthcare management offers excellent salaries in corporate hospitals.",
      learningRoadmap: ["Study Biology and Chemistry", "Pursue BSc Nursing from top institute", "Get experience in government/private hospital", "Consider healthcare management MBA for leadership roles"],
      difficultyLevel: "Beginner",
      salaryPotential: "₹3–15 LPA (India); ₹20–50 LPA (abroad)",
      recommendedSubjects: ["Biology", "Chemistry", "Psychology"],
      matchScore: 76,
    },
  ] : isArts ? [
    {
      goalName: "Graphic Design & UI/UX",
      emoji: "🎨",
      whyItMatches: "Your creative interests are perfect for design — the tech industry pays premium for talented designers who can combine art with user psychology.",
      requiredSkills: ["Visual design", "Figma/Adobe tools", "Typography", "User empathy", "Color theory"],
      futureScope: "UI/UX designers are among the highest-paid non-coders in tech. Indian design talent is exported globally with salaries of ₹8–40 LPA.",
      learningRoadmap: ["Build design portfolio (start now with free tools)", "Learn Figma, Canva, Photoshop basics", "Study design principles online (free courses)", "Pursue BA/BDes in design or self-learn + freelance"],
      difficultyLevel: "Beginner",
      salaryPotential: "₹5–40 LPA",
      recommendedSubjects: ["Fine Arts", "Computer Applications", "Mathematics"],
      matchScore: 92,
    },
    {
      goalName: "Film Making & Media Production",
      emoji: "🎬",
      whyItMatches: "India has the world's largest film industry and a booming OTT sector. Storytellers who understand technology have never been more in demand.",
      requiredSkills: ["Storytelling", "Camera techniques", "Video editing", "Screenplay writing", "Team leadership"],
      futureScope: "Bollywood, OTT platforms (Netflix, Amazon), and YouTube create thousands of high-paying creative jobs. India's media industry is ₹2 trillion and growing.",
      learningRoadmap: ["Start making short films with your phone today", "Learn video editing (DaVinci Resolve is free)", "Pursue BA Film Studies or FTII/SRFTI entrance", "Build portfolio on YouTube/Instagram"],
      difficultyLevel: "Intermediate",
      salaryPotential: "₹3–50+ LPA (wide range)",
      recommendedSubjects: ["English", "Fine Arts", "Computer Applications"],
      matchScore: 86,
    },
    {
      goalName: "Architecture",
      emoji: "🏛️",
      whyItMatches: "Architecture combines art, science, and engineering. If you love design and building things, architects shape the world's cities and spaces.",
      requiredSkills: ["Drawing & Visualization", "Mathematics", "Physics", "Creative thinking", "3D modelling"],
      futureScope: "India's infrastructure boom and smart cities initiative is creating massive demand for architects. Top architects earn ₹20–50 LPA.",
      learningRoadmap: ["Build strong Maths and Physics foundation", "Prepare for NATA/JEE Paper 2 exam", "Pursue B.Arch (5 years)", "Build design portfolio throughout college"],
      difficultyLevel: "Intermediate",
      salaryPotential: "₹4–30 LPA",
      recommendedSubjects: ["Mathematics", "Physics", "Fine Arts"],
      matchScore: 80,
    },
    {
      goalName: "Content Creation & Digital Media",
      emoji: "📱",
      whyItMatches: "The creator economy is real — India has 500 million internet users. If you love creating content, this is a genuine career with massive earning potential.",
      requiredSkills: ["Storytelling", "Video/photo editing", "Social media strategy", "Consistency", "Personal branding"],
      futureScope: "Indian YouTubers and Instagram creators earn ₹5–100 LPA+. Brand collaborations, courses, and merchandise create multiple income streams.",
      learningRoadmap: ["Start creating content in your area of passion today", "Learn basic video editing", "Understand algorithm and SEO basics", "Pursue mass communication/journalism if desired"],
      difficultyLevel: "Beginner",
      salaryPotential: "₹2–100+ LPA (highly variable)",
      recommendedSubjects: ["English", "Computer Applications", "Economics"],
      matchScore: 75,
    },
  ] : isCommerce ? [
    {
      goalName: "Chartered Accountancy (CA)",
      emoji: "📊",
      whyItMatches: "CA is India's most prestigious commerce qualification. Your interest in business and finance makes you a natural candidate for this career.",
      requiredSkills: ["Accounting", "Mathematics", "Analytical thinking", "Attention to detail", "Business law"],
      futureScope: "CA is mandatory for auditing listed companies in India. Big 4 firms (Deloitte, PWC, KPMG, EY) start CAs at ₹8–15 LPA. Partners earn ₹50–200 LPA.",
      learningRoadmap: ["Clear CA Foundation after Class 12", "Pass CA Intermediate (2 years of study)", "Complete 3-year articleship at a CA firm", "Clear CA Final exam — become a qualified CA"],
      difficultyLevel: "Advanced",
      salaryPotential: "₹8–200 LPA",
      recommendedSubjects: ["Accountancy", "Business Studies", "Economics", "Mathematics"],
      matchScore: 93,
    },
    {
      goalName: "Business Administration & MBA",
      emoji: "💼",
      whyItMatches: "Business management opens doors to every industry. IIM graduates are among India's highest-paid professionals.",
      requiredSkills: ["Leadership", "Communication", "Strategic thinking", "Finance basics", "People management"],
      futureScope: "IIM graduates start at ₹25–80 LPA. MBA + experience unlocks C-suite roles. Entrepreneurship, consulting, and investment banking are top options.",
      learningRoadmap: ["Study Commerce with Maths in Class 11-12", "Pursue BBA or B.Com from top college", "Prepare for CAT/XAT/GMAT for MBA", "Target IIMs and top B-schools"],
      difficultyLevel: "Intermediate",
      salaryPotential: "₹8–80+ LPA",
      recommendedSubjects: ["Business Studies", "Accountancy", "Economics", "Mathematics"],
      matchScore: 88,
    },
    {
      goalName: "Investment Banking & Finance",
      emoji: "💹",
      whyItMatches: "Investment banking is one of the highest-paying careers in India. Stock markets, M&A, and corporate finance reward sharp analytical minds.",
      requiredSkills: ["Financial analysis", "Mathematics", "Excel", "Communication", "Valuation"],
      futureScope: "Investment bankers at top firms (Goldman Sachs, Morgan Stanley, JPMorgan India) earn ₹20–100 LPA. CFA + MBA combination is the gold standard.",
      learningRoadmap: ["Excel in Maths and Accounts", "Pursue B.Com/BBA or B.Tech from reputed college", "Get CFA certification", "Target investment bank internships from Year 2"],
      difficultyLevel: "Advanced",
      salaryPotential: "₹15–100 LPA",
      recommendedSubjects: ["Mathematics", "Accountancy", "Economics"],
      matchScore: 82,
    },
    {
      goalName: "Marketing & Brand Management",
      emoji: "📣",
      whyItMatches: "Marketing is the engine of every business. If you understand people and love creativity combined with strategy, brand management is perfect.",
      requiredSkills: ["Creativity", "Communication", "Data analytics", "Consumer psychology", "Digital marketing"],
      futureScope: "Digital marketing managers earn ₹8–25 LPA. Brand managers at FMCG companies (HUL, P&G, Nestlé) earn ₹15–40 LPA with fast career growth.",
      learningRoadmap: ["Study Business Studies and Economics", "Pursue BBA/B.Com in Marketing", "Get Google/Meta digital marketing certifications", "Target MBA in Marketing from IIMs"],
      difficultyLevel: "Beginner",
      salaryPotential: "₹5–40 LPA",
      recommendedSubjects: ["Business Studies", "Economics", "Computer Applications"],
      matchScore: 78,
    },
  ] : [
    // Default/Science recommendations
    {
      goalName: "Engineering & Technology",
      emoji: "⚙️",
      whyItMatches: "Engineering is India's most popular career path with excellent scope across infrastructure, manufacturing, IT, and core engineering sectors.",
      requiredSkills: ["Mathematics", "Physics", "Problem-solving", "Analytical thinking", "Programming basics"],
      futureScope: "India needs millions of engineers for infrastructure, digital transformation, and manufacturing. IIT/NIT graduates start at ₹10–80 LPA.",
      learningRoadmap: ["Excel in Class 11-12 PCM", "Crack JEE Main/Advanced", "Pursue B.Tech from IIT/NIT/top private college", "Choose specialisation based on interest"],
      difficultyLevel: "Intermediate",
      salaryPotential: "₹5–80 LPA",
      recommendedSubjects: ["Mathematics", "Physics", "Computer Science"],
      matchScore: 88,
    },
    {
      goalName: "Government Services (IAS/IPS/IFS)",
      emoji: "🏛️",
      whyItMatches: "UPSC Civil Services is one of India's most prestigious exams. Government officers have power, prestige, and job security like no other career.",
      requiredSkills: ["General knowledge", "Essay writing", "Current affairs", "Leadership", "Administrative thinking"],
      futureScope: "IAS/IPS officers run districts, states, and central ministries. They earn ₹56,000–2,50,000/month with perks including housing, transport, and pension.",
      learningRoadmap: ["Build reading habit — newspapers, NCERT books", "Graduate from any stream (no specific requirement)", "Start UPSC preparation from graduation year", "Clear Prelims → Mains → Interview (3-stage process)"],
      difficultyLevel: "Advanced",
      salaryPotential: "₹8–30 LPA + significant perks and authority",
      recommendedSubjects: ["Political Science", "History", "Geography", "Economics"],
      matchScore: 82,
    },
    {
      goalName: "Science & Research",
      emoji: "🔬",
      whyItMatches: "India's research ecosystem at IISc, TIFR, IITs, and CSIR labs is world-class. Scientists drive India's technological future.",
      requiredSkills: ["Mathematics", "Critical thinking", "Lab skills", "Patience", "Scientific writing"],
      futureScope: "Research scientists at ISRO, DRDO, CSIR earn ₹8–25 LPA with complete job security. International research opportunities add to the appeal.",
      learningRoadmap: ["Build exceptional Maths and Science foundation", "Pursue BSc or integrated BS-MS at IISc/IISER/IIT", "Apply for research fellowships (KVPY, DST)", "Complete PhD for senior research roles"],
      difficultyLevel: "Advanced",
      salaryPotential: "₹8–30 LPA (academia); ₹15–50 LPA (industry R&D)",
      recommendedSubjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
      matchScore: 85,
    },
    {
      goalName: "Education & Teaching",
      emoji: "📚",
      whyItMatches: "Teachers shape every other profession. India's National Education Policy 2020 has elevated the teaching profession with better pay and recognition.",
      requiredSkills: ["Subject expertise", "Communication", "Patience", "Creativity", "Empathy"],
      futureScope: "School teachers earn ₹4–12 LPA (government) to ₹8–20 LPA (top private schools). EdTech teaching (online) pays ₹10–40 LPA for subject experts.",
      learningRoadmap: ["Excel in your chosen subjects", "Complete graduation in your subject", "Pursue B.Ed (Bachelor of Education)", "Clear CTET/TET for government school positions"],
      difficultyLevel: "Beginner",
      salaryPotential: "₹4–20 LPA",
      recommendedSubjects: ["Any core subject you love"],
      matchScore: 78,
    },
  ];

  const exploreMore = [
    {
      goalName: "Psychology & Counselling",
      emoji: "🧠",
      matchPercentage: 68,
      description: "Understanding the human mind — in demand for schools, corporates, and hospitals across India.",
      requiredSkills: ["Empathy", "Active listening", "Observation"],
      futureOpportunities: ["Clinical Psychologist", "School Counsellor", "HR Specialist", "Therapist"],
    },
    {
      goalName: "Law & Legal Services",
      emoji: "⚖️",
      matchPercentage: 65,
      description: "India's legal profession is evolving fast with demand for tech-law, IPR, and corporate legal experts.",
      requiredSkills: ["Logical reasoning", "Communication", "Research", "Argumentation"],
      futureOpportunities: ["Advocate", "Corporate Lawyer", "Judge", "Legal Consultant"],
    },
    {
      goalName: "Sports & Physical Education",
      emoji: "🏆",
      matchPercentage: 62,
      description: "India's sports ecosystem is booming post-Olympics. Coaches, sports scientists, and managers are in high demand.",
      requiredSkills: ["Physical fitness", "Teamwork", "Discipline", "Strategy"],
      futureOpportunities: ["Professional Athlete", "Sports Coach", "Sports Manager", "PE Teacher"],
    },
    {
      goalName: "Environmental Science & Sustainability",
      emoji: "🌍",
      matchPercentage: 58,
      description: "Climate change is creating careers in renewable energy, conservation, and environmental consulting.",
      requiredSkills: ["Biology", "Chemistry", "Data analysis", "Field research"],
      futureOpportunities: ["Environmental Consultant", "Renewable Energy Engineer", "Wildlife Conservationist", "Climate Scientist"],
    },
  ];

  const personalityProfile = {
    type: isTech ? "Tech-Driven Problem Solver" : isMedical ? "Caring Science Enthusiast" : isArts ? "Creative Visionary" : isCommerce ? "Business-Minded Strategist" : "Curious Analytical Learner",
    description: `Based on what you've shared, you show strong ${isTech ? "logical and technical aptitude" : isMedical ? "scientific curiosity and empathy" : isArts ? "creative and expressive" : isCommerce ? "business and financial" : "analytical and intellectual"} traits. You're the kind of person who ${isTech ? "loves understanding how things work and building solutions" : isMedical ? "cares deeply about people's wellbeing and wants to make a difference" : isArts ? "sees the world differently and expresses ideas beautifully" : isCommerce ? "thinks strategically about how value is created and exchanged" : "asks deep questions and loves learning new things"}.`,
    strengths: isTech
      ? ["Logical reasoning", "Technical aptitude", "Problem-solving", "Systematic thinking"]
      : isMedical
      ? ["Empathy", "Scientific curiosity", "Attention to detail", "Care for others"]
      : isArts
      ? ["Creativity", "Visual thinking", "Emotional intelligence", "Original ideas"]
      : isCommerce
      ? ["Strategic thinking", "Numerical aptitude", "Leadership potential", "Communication"]
      : ["Intellectual curiosity", "Analytical thinking", "Adaptability", "Deep learning"],
    learningPattern: isTech
      ? "Hands-on builder — you learn best by doing and experimenting"
      : isMedical
      ? "Detail-oriented learner who thrives with real case studies"
      : isArts
      ? "Visual and experiential learner who needs creative freedom"
      : isCommerce
      ? "Goal-oriented learner who connects concepts to real-world outcomes"
      : "Conceptual thinker who loves understanding the 'why' behind everything",
  };

  res.json({ personalityProfile, topRecommendations: recommendations, exploreMore });
});

export default router;
