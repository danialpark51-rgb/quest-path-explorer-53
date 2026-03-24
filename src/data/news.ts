export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  emoji: string;
};

export const newsItems: NewsItem[] = [
  { id: "1", title: "ISRO's Gaganyaan Mission Update", summary: "India's first crewed space mission reaches a new milestone with successful test flights.", category: "Space", date: "2026-03-24", emoji: "🚀" },
  { id: "2", title: "New NEP 2024 Updates", summary: "Major changes in the National Education Policy to promote skill-based learning.", category: "Education", date: "2026-03-23", emoji: "📚" },
  { id: "3", title: "AI Revolution in Healthcare", summary: "Artificial intelligence is now diagnosing diseases faster than experienced doctors.", category: "Technology", date: "2026-03-22", emoji: "🤖" },
  { id: "4", title: "JEE Main 2026 Dates Announced", summary: "NTA releases the official schedule for JEE Main examinations.", category: "Exams", date: "2026-03-21", emoji: "📝" },
  { id: "5", title: "Climate Change: Youth Action", summary: "Students across India lead initiatives to combat climate change at the grassroots level.", category: "Environment", date: "2026-03-20", emoji: "🌍" },
  { id: "6", title: "NEET 2026 Registration Open", summary: "Medical entrance exam registration begins with new online system.", category: "Exams", date: "2026-03-19", emoji: "🏥" },
  { id: "7", title: "Mars Rover Discovers Water Ice", summary: "NASA's latest rover confirms presence of water ice on Mars surface.", category: "Space", date: "2026-03-18", emoji: "🔴" },
  { id: "8", title: "Digital India 3.0 Launched", summary: "Government launches new initiatives for digital literacy in rural areas.", category: "Technology", date: "2026-03-17", emoji: "💻" },
];
