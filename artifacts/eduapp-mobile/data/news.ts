export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  iconName: string;
  color: string;
  content: string;
};

export const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "ISRO's Gaganyaan Mission Update",
    summary: "India's first crewed space mission reaches a new milestone with successful test flights and astronaut training.",
    category: "Space",
    date: "Today",
    iconName: "rocket",
    color: "#8b5cf6",
    content: "ISRO's ambitious Gaganyaan mission continues to make steady progress. The crew module and service module have completed multiple unmanned test flights. Four Indian astronauts have completed training at Russia's Gagarin Research & Test Cosmonaut Training Center. The mission aims to demonstrate India's capability to send humans to low Earth orbit and bring them back safely.",
  },
  {
    id: "2",
    title: "AI Revolution in Healthcare",
    summary: "AI systems now diagnose diseases faster than experienced doctors in multiple studies worldwide.",
    category: "Technology",
    date: "Today",
    iconName: "hardware-chip",
    color: "#0891b2",
    content: "Artificial intelligence is transforming healthcare at an unprecedented pace. AI algorithms can now detect cancers in medical scans with accuracy matching or exceeding that of experienced radiologists. In India, AI-powered tools are being deployed in rural health centers to screen for diabetic retinopathy, tuberculosis, and cardiovascular diseases.",
  },
  {
    id: "3",
    title: "New NEP 2024 Skill-Based Learning",
    summary: "Major changes promote coding, financial literacy, and AI education from Class 6 onwards.",
    category: "Education",
    date: "Today",
    iconName: "book",
    color: "#10b981",
    content: "The National Education Policy continues to reshape Indian education. New guidelines emphasize skill-based learning, with coding, financial literacy, and artificial intelligence being introduced from Class 6. Schools are encouraged to adopt experiential learning methods, reduce rote memorization, and focus on critical thinking.",
  },
  {
    id: "4",
    title: "JEE Main 2026 Schedule Released",
    summary: "NTA announces dates, new exam centers added in tier-2 cities for better accessibility.",
    category: "Exams",
    date: "Yesterday",
    iconName: "document-text",
    color: "#f59e0b",
    content: "The National Testing Agency has released the official schedule for JEE Main 2026. Session 1 will be held in January and Session 2 in April. This year, NTA has added 200 new exam centers in tier-2 and tier-3 cities to improve accessibility. The exam will follow the new pattern with increased emphasis on conceptual understanding.",
  },
  {
    id: "5",
    title: "NEET 2026 New Pattern Announced",
    summary: "Medical entrance exam introduces competency-based questions and reduced negative marking.",
    category: "Exams",
    date: "2 days ago",
    iconName: "medkit",
    color: "#ef4444",
    content: "The NEET 2026 exam will feature a revised pattern focusing on competency-based questions rather than factual recall. Negative marking has been reduced from -1 to -0.5 for incorrect answers. The number of questions remains 200, but students will now have 3 hours and 20 minutes to complete the exam.",
  },
  {
    id: "6",
    title: "India Wins Olympic Gold in Chess",
    summary: "India's chess team creates history at the Chess Olympiad with a dominant performance.",
    category: "Sports",
    date: "3 days ago",
    iconName: "trophy",
    color: "#f59e0b",
    content: "India's chess team has delivered a historic performance at the Chess Olympiad, winning gold in both the open and women's sections. Led by young grandmasters who are among the world's top-ranked players, the team dominated the competition. This success reflects India's growing strength in chess, inspired by legends like Viswanathan Anand.",
  },
  {
    id: "7",
    title: "CBSE Introduces AI Curriculum",
    summary: "Artificial Intelligence becomes a core subject option from Class 9 in CBSE schools.",
    category: "Education",
    date: "5 days ago",
    iconName: "school",
    color: "#3b82f6",
    content: "CBSE has announced that Artificial Intelligence will be available as a core subject option from Class 9 starting this academic year. The curriculum covers machine learning basics, data science, neural networks, and ethical AI. Students will complete hands-on projects using Python and popular AI frameworks.",
  },
  {
    id: "8",
    title: "India's Startup Ecosystem Grows",
    summary: "India crosses 100,000 registered startups, becoming the world's third-largest startup ecosystem.",
    category: "Business",
    date: "6 days ago",
    iconName: "trending-up",
    color: "#10b981",
    content: "India has crossed the milestone of 100,000 registered startups, making it the world's third-largest startup ecosystem after the US and China. Over 40% of these startups are in tier-2 and tier-3 cities, reflecting the democratization of entrepreneurship. The government's Startup India initiative has provided tax benefits and simplified regulations.",
  },
];
