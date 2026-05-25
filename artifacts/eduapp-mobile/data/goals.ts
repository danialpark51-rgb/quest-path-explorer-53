export type Goal = {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  fields: string[];
  skills: string[];
  careers: string[];
  difficulty: string;
  salaryRange: string;
  roleModel: string;
};

export const goals: Goal[] = [
  {
    id: "engineering",
    title: "Engineering",
    icon: "construct",
    color: "#3b82f6",
    description: "Solve real-world problems using science, technology, and creativity.",
    fields: ["Computer Science", "Mechanical", "Electrical", "Civil", "Aerospace", "AI & Robotics"],
    skills: ["Strong math", "Logical thinking", "Coding", "Physics fundamentals"],
    careers: ["Software Engineer", "Mechanical Engineer", "Data Scientist", "Robotics Engineer"],
    difficulty: "High",
    salaryRange: "₹6L – ₹50L+",
    roleModel: "APJ Abdul Kalam",
  },
  {
    id: "medical",
    title: "Medical",
    icon: "medkit",
    color: "#ef4444",
    description: "Become a doctor who diagnoses and treats patients with scientific knowledge and empathy.",
    fields: ["MBBS", "Surgery", "Dentistry", "Pharmacy", "Nursing", "Research"],
    skills: ["Biology knowledge", "Hard-working mindset", "Emotional strength", "Scientific thinking"],
    careers: ["Doctor", "Surgeon", "Dentist", "Pathologist", "Medical Researcher"],
    difficulty: "Very High",
    salaryRange: "₹8L – ₹80L+",
    roleModel: "Dr. Devi Shetty",
  },
  {
    id: "commerce",
    title: "Commerce & Business",
    icon: "trending-up",
    color: "#10b981",
    description: "Study of money, management, business, finance, marketing, and markets.",
    fields: ["Accounting", "Finance", "Marketing", "Business Management", "Economics"],
    skills: ["Basic mathematics", "Communication", "Decision making", "Problem solving"],
    careers: ["CA", "Financial Analyst", "Business Manager", "Entrepreneur", "Marketing Expert"],
    difficulty: "Medium",
    salaryRange: "₹5L – ₹40L+",
    roleModel: "Ratan Tata",
  },
  {
    id: "arts",
    title: "Arts & Humanities",
    icon: "color-palette",
    color: "#f59e0b",
    description: "Study of society, culture, law, psychology, languages, and history.",
    fields: ["Law", "Psychology", "Journalism", "Design", "Languages", "History"],
    skills: ["Creativity", "Critical thinking", "Reading & analysis", "Communication"],
    careers: ["Lawyer", "Psychologist", "Journalist", "Teacher", "Designer"],
    difficulty: "Medium",
    salaryRange: "₹4L – ₹30L+",
    roleModel: "Arundhati Roy",
  },
  {
    id: "it",
    title: "IT & Computer Skills",
    icon: "laptop",
    color: "#8b5cf6",
    description: "Work with computers, software, data, AI and cybersecurity.",
    fields: ["Web Development", "App Development", "AI/ML", "Cybersecurity", "Data Science", "Cloud"],
    skills: ["Coding", "Problem solving", "Math basics", "Logical thinking"],
    careers: ["Web Developer", "App Developer", "Ethical Hacker", "Data Scientist", "AI Engineer"],
    difficulty: "Medium-High",
    salaryRange: "₹5L – ₹60L+",
    roleModel: "Sundar Pichai",
  },
  {
    id: "defence",
    title: "Defence Services",
    icon: "shield",
    color: "#92400e",
    description: "Protecting the nation with discipline, bravery, and service.",
    fields: ["Army", "Navy", "Air Force", "Para-Special Forces", "Coast Guard"],
    skills: ["Physical fitness", "Dedication", "IQ & reasoning", "Leadership"],
    careers: ["Army Officer", "Naval Officer", "Pilot", "Para-Special Forces", "Coast Guard"],
    difficulty: "Very High",
    salaryRange: "₹6L – ₹25L+",
    roleModel: "Field Marshal Sam Manekshaw",
  },
  {
    id: "govt",
    title: "Government Exams",
    icon: "business",
    color: "#0891b2",
    description: "Prepare for UPSC, Civil Services, SSC, Banking, and government examinations.",
    fields: ["UPSC/IAS", "SSC", "Banking", "Railways", "State PSC", "Teaching"],
    skills: ["General knowledge", "Current affairs", "Analytical thinking", "Writing skills"],
    careers: ["IAS Officer", "IPS Officer", "Bank PO", "SSC Officer", "Civil Judge"],
    difficulty: "Very High",
    salaryRange: "₹5L – ₹30L+",
    roleModel: "Tina Dabi",
  },
  {
    id: "aviation",
    title: "Aviation & Pilot",
    icon: "airplane",
    color: "#0369a1",
    description: "Fly aircraft, manage aviation operations, and explore aerospace careers.",
    fields: ["Commercial Pilot", "Aircraft Maintenance", "Air Traffic Control", "Aerospace", "Cabin Crew"],
    skills: ["Physics", "Quick decision making", "Calm temperament", "Communication"],
    careers: ["Commercial Pilot", "Flight Engineer", "ATC Officer", "Cabin Crew", "Aerospace Engineer"],
    difficulty: "Very High",
    salaryRange: "₹8L – ₹50L+",
    roleModel: "JRD Tata",
  },
];
