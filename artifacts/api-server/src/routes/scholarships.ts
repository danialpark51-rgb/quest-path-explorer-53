/**
 * POST /api/scholarships
 * Returns AI-powered scholarship recommendations tailored to the student's profile.
 */

import { Router, type IRouter } from "express";
import { callAI, parseAIJson } from "../lib/ai";

const router: IRouter = Router();

interface Scholarship {
  name: string;
  emoji: string;
  eligibility: string;
  amount: string;
  deadline: string;
  officialWebsite: string;
  requiredDocuments: string[];
  selectionProcess: string;
  applicationGuide: string[];
  locationEligibility: string;
  importantNotes: string;
  category: "Central Government" | "State Government" | "Private" | "NGO" | "International";
  matchScore: number;
}

interface ScholarshipsResponse {
  summary: string;
  scholarships: Scholarship[];
  tips: string[];
}

router.post("/scholarships", async (req, res) => {
  const { classStandard, skills, location, interests, name } = req.body as {
    classStandard?: string;
    skills?: string;
    location?: string;
    interests?: string;
    name?: string;
  };

  if (!classStandard) {
    res.status(400).json({ error: "Class/Standard is required." });
    return;
  }

  const studentName  = (name || "the student").toString().slice(0, 50);
  const studentClass = classStandard.toString().slice(0, 10);
  const studentLoc   = (location || "India").toString().slice(0, 100);
  const studentSkills = (skills || "").toString().slice(0, 500);
  const studentInterests = (interests || "").toString().slice(0, 500);

  const prompt = `You are an expert Indian education counsellor with deep knowledge of scholarships available to school and college students in India.

Student Profile:
- Name: ${studentName}
- Class/Standard: ${studentClass}
- Location: ${studentLoc}
- Skills: ${studentSkills || "Not specified"}
- Interests: ${studentInterests || "Not specified"}

Generate a list of REAL, OFFICIAL scholarships available to this student. Return ONLY valid JSON — no markdown, no code fences.

{
  "summary": "2-sentence personalised message about scholarship opportunities for this student",
  "scholarships": [
    {
      "name": "National Means-cum-Merit Scholarship (NMMS)",
      "emoji": "🏆",
      "eligibility": "Specific eligibility criteria including class, income, marks requirements",
      "amount": "₹12,000 per year",
      "deadline": "Usually October-November (check official site for current year)",
      "officialWebsite": "https://scholarships.gov.in",
      "requiredDocuments": [
        "Aadhaar Card",
        "Income Certificate",
        "Previous year marksheet",
        "Bank passbook",
        "Caste certificate (if applicable)"
      ],
      "selectionProcess": "Written exam / Merit-based / Interview process description",
      "applicationGuide": [
        "Step 1: Visit the official website",
        "Step 2: Register with your Aadhaar number",
        "Step 3: Fill in academic details",
        "Step 4: Upload required documents",
        "Step 5: Submit before the deadline",
        "Step 6: Track application status online"
      ],
      "locationEligibility": "All India / Specific states",
      "importantNotes": "Key things to know — renewal conditions, income limits, etc.",
      "category": "Central Government",
      "matchScore": 90
    }
  ],
  "tips": [
    "Apply to multiple scholarships simultaneously",
    "Keep all documents ready in digital format",
    "Check NSP (National Scholarship Portal) for centralized applications"
  ]
}

Rules:
- Include 6-8 REAL scholarships that genuinely exist and are relevant to Class ${studentClass} students
- Only include genuine, official scholarships — NO fake or invented ones
- Include a mix: government (central + state), private foundations, NGO scholarships
- Prioritise by matchScore (highest first)
- Always include NSP (scholarships.gov.in) based ones for Classes 9-12
- For Class 5-8: NMMS, Pre-Matric scholarships, state scholarships
- For Class 9-10: NMMS, Pre-Matric, NSP scholarships, Inspire
- For Class 11-12: Post-Matric, INSPIRE, Central Sector Scheme, private scholarships
- Include location-specific ones if ${studentLoc} is a specific state
- Real websites only (scholarships.gov.in, buddy4study.com, etc.)`;

  const raw = await callAI(prompt, 3000);
  const parsed = raw ? parseAIJson<ScholarshipsResponse>(raw) : null;

  if (parsed && Array.isArray(parsed.scholarships) && parsed.scholarships.length > 0) {
    res.json(parsed);
    return;
  }

  // ─── Static fallback — real Indian scholarships ───────────────────────────
  const classNum = parseInt(studentClass.replace(/\D/g, ""), 10) || 10;

  const allScholarships: Scholarship[] = [
    {
      name: "Central Sector Scheme of Scholarship (CSSS)",
      emoji: "🏛️",
      eligibility: "Class 12 pass students (top 20 percentile) pursuing graduation. Family income ≤ ₹8 LPA.",
      amount: "₹10,000/year for graduation, ₹20,000/year for post-graduation",
      deadline: "October–November (check scholarships.gov.in)",
      officialWebsite: "https://scholarships.gov.in",
      requiredDocuments: ["Aadhaar Card", "Class 12 marksheet", "Income Certificate", "Bank passbook", "College admission letter"],
      selectionProcess: "Merit-based — top 20 percentile of board exam",
      applicationGuide: [
        "Step 1: Register on National Scholarship Portal (scholarships.gov.in)",
        "Step 2: Log in and select Central Sector Scheme",
        "Step 3: Fill academic and personal details",
        "Step 4: Upload required documents",
        "Step 5: Submit and note application ID",
        "Step 6: Track status on NSP dashboard",
      ],
      locationEligibility: "All India",
      importantNotes: "Renewable each year on maintaining 50% marks. Direct bank transfer via DBT.",
      category: "Central Government",
      matchScore: 92,
    },
    {
      name: "INSPIRE Scholarship (SHE) — DST",
      emoji: "🔬",
      eligibility: "Top 1% in Class 12 board exams pursuing BSc/BS/Int.MSc in Natural Sciences. Age below 22.",
      amount: "₹80,000/year (₹60,000 + ₹20,000 mentorship grant)",
      deadline: "July–August (check dst.gov.in)",
      officialWebsite: "https://online-inspire.gov.in",
      requiredDocuments: ["Class 12 marksheet", "Board rank certificate", "Aadhaar", "College bonafide", "Bank details"],
      selectionProcess: "Merit-based — top 1% of board exam or cleared JEE/NEET",
      applicationGuide: [
        "Step 1: Visit online-inspire.gov.in",
        "Step 2: Register with your email and mobile",
        "Step 3: Enter Class 12 details and upload marksheet",
        "Step 4: Get verification from your college",
        "Step 5: Submit and await DST approval",
      ],
      locationEligibility: "All India",
      importantNotes: "Only for pure science streams (Physics, Chemistry, Biology, Maths). Not for engineering/medical.",
      category: "Central Government",
      matchScore: 88,
    },
    {
      name: "National Means-cum-Merit Scholarship (NMMS)",
      emoji: "⭐",
      eligibility: "Class 8 students from government schools. Family income ≤ ₹3.5 LPA. Min 55% in Class 7.",
      amount: "₹12,000/year (Classes 9–12)",
      deadline: "October–November state-wise",
      officialWebsite: "https://scholarships.gov.in",
      requiredDocuments: ["Aadhaar", "Class 7 marksheet", "Income Certificate", "School bonafide", "Bank passbook"],
      selectionProcess: "State-level written exam (MAT + SAT)",
      applicationGuide: [
        "Step 1: Register through your school principal",
        "Step 2: Appear in state-level NMMS exam",
        "Step 3: If selected, register on NSP",
        "Step 4: Upload documents online",
        "Step 5: Renewal each year by submitting marks",
      ],
      locationEligibility: "All India (state government schools only)",
      importantNotes: "Only for students in government/government-aided schools. Cannot be availed alongside other central scholarships.",
      category: "Central Government",
      matchScore: classNum <= 8 ? 95 : 60,
    },
    {
      name: "Post-Matric Scholarship (NSP)",
      emoji: "🎓",
      eligibility: "Students in Class 11 and above from SC/ST/OBC/Minority communities. Income limit varies by category.",
      amount: "Up to ₹35,000/year depending on course and category",
      deadline: "October–December (scholarships.gov.in)",
      officialWebsite: "https://scholarships.gov.in",
      requiredDocuments: ["Caste certificate", "Income certificate", "Aadhaar", "Previous year marksheet", "Fee receipt", "Bank passbook"],
      selectionProcess: "Income and category based — no separate exam",
      applicationGuide: [
        "Step 1: Visit scholarships.gov.in and register",
        "Step 2: Select your scholarship category",
        "Step 3: Fill in all details carefully",
        "Step 4: Upload supporting documents",
        "Step 5: Submit and verify through your institution",
      ],
      locationEligibility: "All India",
      importantNotes: "Fresh application each year. Income limit for OBC is ₹2.5 LPA, SC/ST is ₹2.5 LPA (Central). State limits differ.",
      category: "Central Government",
      matchScore: 85,
    },
    {
      name: "Kishore Vaigyanik Protsahan Yojana (KVPY)",
      emoji: "🧪",
      eligibility: "Class 11–12 students and first-year BSc/BS pursuing science. Min 75% in Class 10/12.",
      amount: "₹5,000–7,000/month stipend + annual contingency grant",
      deadline: "July–August (kvpy.iisc.ernet.in)",
      officialWebsite: "https://kvpy.iisc.ernet.in",
      requiredDocuments: ["Class 10/12 marksheet", "Aadhaar", "College letter (if applicable)", "Bank details"],
      selectionProcess: "Aptitude test (Stage 1) + Interview (Stage 2)",
      applicationGuide: [
        "Step 1: Apply online at kvpy.iisc.ernet.in during application window",
        "Step 2: Prepare for aptitude test (Physics, Chemistry, Biology, Maths)",
        "Step 3: Clear Stage 1 exam (October/November)",
        "Step 4: If shortlisted, attend Stage 2 interview",
        "Step 5: Fellows get IISc library access + research opportunities",
      ],
      locationEligibility: "All India",
      importantNotes: "Highly competitive. Selected students can pursue research at IISc/IIT during holidays. Fellowship ID opens doors to top research institutes.",
      category: "Central Government",
      matchScore: 82,
    },
    {
      name: "Buddy4Study — Tata Capital Pankh Scholarship",
      emoji: "🦋",
      eligibility: "Class 11–12 students with family income ≤ ₹4 LPA. Minimum 60% marks.",
      amount: "Up to ₹12,000/year",
      deadline: "Check buddy4study.com (rolling applications)",
      officialWebsite: "https://www.buddy4study.com/scholarship/tata-capital-pankh-scholarship-program",
      requiredDocuments: ["Income proof", "Marksheet", "Aadhaar", "Bank passbook", "Essay on goals"],
      selectionProcess: "Application review + essay evaluation",
      applicationGuide: [
        "Step 1: Visit buddy4study.com and search Tata Capital Pankh",
        "Step 2: Create a free account",
        "Step 3: Fill the scholarship form with all details",
        "Step 4: Write a compelling personal statement",
        "Step 5: Submit before deadline",
      ],
      locationEligibility: "All India",
      importantNotes: "For students who have faced financial hardship. Strong personal essay can make a difference.",
      category: "Private",
      matchScore: 78,
    },
    {
      name: "Sitaram Jindal Foundation Scholarship",
      emoji: "🌟",
      eligibility: "Class 8–12 students and college students. Minimum 55% marks. Monthly family income ≤ ₹25,000.",
      amount: "₹500–2,000/month depending on class",
      deadline: "June–September (sitaramjindalfoundation.org)",
      officialWebsite: "https://www.sitaramjindalfoundation.org",
      requiredDocuments: ["Marksheet", "Income certificate", "Aadhaar", "Bonafide certificate", "Bank passbook", "Photograph"],
      selectionProcess: "Merit-cum-means based",
      applicationGuide: [
        "Step 1: Download application form from official website",
        "Step 2: Fill and attach all required documents",
        "Step 3: Submit to nearest Jindal office or by post",
        "Step 4: Await confirmation",
      ],
      locationEligibility: "All India (priority to Karnataka, Odisha, Rajasthan, Haryana)",
      importantNotes: "One of India's oldest private scholarships — running since 1969. Very reliable and trustworthy.",
      category: "Private",
      matchScore: 75,
    },
    {
      name: "Vidyasaarathi Scholarship Portal",
      emoji: "📚",
      eligibility: "Various — multiple scholarships for Classes 8–12 and college students. Check individual schemes.",
      amount: "₹5,000–50,000/year depending on scholarship",
      deadline: "Rolling — multiple deadlines throughout the year",
      officialWebsite: "https://www.vidyasaarathi.co.in",
      requiredDocuments: ["Aadhaar", "Marksheet", "Income Certificate", "Bank passbook"],
      selectionProcess: "Varies by scholarship — merit and means",
      applicationGuide: [
        "Step 1: Register on vidyasaarathi.co.in",
        "Step 2: Browse available scholarships for your class",
        "Step 3: Apply to multiple relevant scholarships",
        "Step 4: Track application status on dashboard",
      ],
      locationEligibility: "All India",
      importantNotes: "Backed by NSDL and major corporates including LIC, SBI, Infosys Foundation. Multiple scholarships on one platform.",
      category: "Private",
      matchScore: 72,
    },
  ];

  // Filter by class relevance
  const relevant = allScholarships.filter((s) => {
    if (classNum <= 8) return s.matchScore > 60 || s.name.includes("NMMS");
    if (classNum <= 10) return !s.name.includes("Central Sector");
    return true;
  });

  const scholarships = relevant
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 7);

  const summary = `Here are ${scholarships.length} real scholarships available for Class ${studentClass} students in India. Apply to multiple — it increases your chances significantly!`;
  const tips = [
    "Apply to at least 3-5 scholarships simultaneously — more applications = better chances",
    "Keep digital copies of all documents ready (Aadhaar, marksheets, income certificate)",
    "Check scholarships.gov.in and buddy4study.com weekly — new scholarships open throughout the year",
    "Renewal is usually required every year — maintain good marks",
    "Never pay any fee to apply for a scholarship — all real scholarships are free to apply",
  ];

  res.json({ summary, scholarships, tips });
});

export default router;
