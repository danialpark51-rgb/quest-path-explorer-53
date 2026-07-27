/**
 * GK (General Knowledge) Route
 *
 * GET /api/gk/topics       — list all GK topics
 * GET /api/gk/quiz/:topic  — quiz questions for a topic
 * GET /api/gk/search?q=    — search across topics/questions
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

interface GKTopicMeta {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  lessonCount: number;
}

interface GKQuizQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOPICS: GKTopicMeta[] = [
  { id: "world-history",   name: "World History",       emoji: "📜", description: "Key events that shaped civilizations across the globe.", color: "from-amber-500 to-orange-600",   lessonCount: 3 },
  { id: "indian-history",  name: "Indian History",      emoji: "🇮🇳", description: "From ancient empires to modern independent India.",     color: "from-orange-500 to-red-600",     lessonCount: 3 },
  { id: "geography",       name: "Geography",           emoji: "🗺️", description: "Physical features, countries, capitals and rivers.",    color: "from-green-500 to-teal-600",     lessonCount: 3 },
  { id: "science",         name: "Science",             emoji: "🔬", description: "Physics, Chemistry, Biology — fundamentals explained.", color: "from-blue-500 to-cyan-600",      lessonCount: 3 },
  { id: "space",           name: "Space & Astronomy",   emoji: "🚀", description: "Planets, stars, missions, and the universe.",           color: "from-indigo-600 to-purple-700",  lessonCount: 3 },
  { id: "technology",      name: "Technology",          emoji: "💻", description: "Innovations, inventions, and the digital revolution.",  color: "from-violet-500 to-blue-600",    lessonCount: 3 },
  { id: "environment",     name: "Environment",         emoji: "🌍", description: "Climate, ecosystems, conservation, and green energy.",  color: "from-emerald-500 to-green-600",  lessonCount: 3 },
  { id: "economy",         name: "Economy",             emoji: "💰", description: "Finance, trade, GDP, banking, and India's economy.",   color: "from-yellow-500 to-amber-600",   lessonCount: 3 },
  { id: "sports",          name: "Sports",              emoji: "🏆", description: "Olympics, cricket, major tournaments and legends.",    color: "from-red-500 to-rose-600",       lessonCount: 3 },
  { id: "awards",          name: "Awards & Honours",    emoji: "🏅", description: "Nobel, Bharat Ratna, Oscars, and global recognitions.", color: "from-fuchsia-500 to-pink-600",   lessonCount: 3 },
  { id: "constitution",    name: "Indian Constitution", emoji: "⚖️", description: "Rights, duties, articles and the framework of India.", color: "from-slate-600 to-gray-700",     lessonCount: 3 },
  { id: "current-affairs", name: "Current Affairs",     emoji: "📰", description: "Recent events, India and world news highlights.",       color: "from-sky-500 to-blue-600",       lessonCount: 3 },
];

// ─── Quiz Questions per topic ──────────────────────────────────────────────────

const QUESTIONS: Record<string, GKQuizQuestion[]> = {
  "world-history": [
    { id: "wh-q1", topicId: "world-history", difficulty: "easy",   question: "In which year did World War II end?",                              options: ["1943", "1944", "1945", "1946"],                                     answer: 2, explanation: "WWII ended in 1945 — V-E Day on May 8 in Europe, V-J Day on Sep 2 in the Pacific." },
    { id: "wh-q2", topicId: "world-history", difficulty: "easy",   question: "Who invented the telephone?",                                       options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Marconi"],  answer: 1, explanation: "Alexander Graham Bell patented the telephone in 1876." },
    { id: "wh-q3", topicId: "world-history", difficulty: "medium", question: "The French Revolution began in which year?",                        options: ["1776", "1789", "1799", "1804"],                                     answer: 1, explanation: "The French Revolution began in 1789 with the storming of the Bastille on July 14." },
    { id: "wh-q4", topicId: "world-history", difficulty: "medium", question: "Who led the first circumnavigation of the Earth?",                  options: ["Columbus", "Vasco da Gama", "Ferdinand Magellan", "Francis Drake"],  answer: 2, explanation: "Magellan's expedition (1519–22) was the first to circumnavigate Earth." },
    { id: "wh-q5", topicId: "world-history", difficulty: "hard",   question: "The Treaty of Versailles (1919) ended which war?",                  options: ["Crimean War", "World War I", "World War II", "Franco-Prussian War"],  answer: 1, explanation: "The Treaty of Versailles ended World War I on June 28, 1919." },
    { id: "wh-q6", topicId: "world-history", difficulty: "easy",   question: "Which country was first to give women the right to vote?",          options: ["USA", "UK", "New Zealand", "Australia"],                            answer: 2, explanation: "New Zealand granted women suffrage in 1893." },
    { id: "wh-q7", topicId: "world-history", difficulty: "medium", question: "The Renaissance movement originated in which country?",             options: ["France", "Spain", "Italy", "Germany"],                             answer: 2, explanation: "The Renaissance began in Florence, Italy in the 14th century." },
    { id: "wh-q8", topicId: "world-history", difficulty: "hard",   question: "Who wrote The Communist Manifesto?",                                options: ["Lenin & Stalin", "Marx & Engels", "Trotsky & Marx", "Rousseau"],    answer: 1, explanation: "Karl Marx and Friedrich Engels wrote The Communist Manifesto in 1848." },
  ],
  "indian-history": [
    { id: "ih-q1", topicId: "indian-history", difficulty: "easy",   question: "India gained independence on which date?",                          options: ["15 Aug 1947", "26 Jan 1950", "15 Aug 1950", "26 Jan 1947"],          answer: 0, explanation: "India gained independence on 15 August 1947." },
    { id: "ih-q2", topicId: "indian-history", difficulty: "easy",   question: "Who was India's first Prime Minister?",                            options: ["Sardar Patel", "Mahatma Gandhi", "Jawaharlal Nehru", "Ambedkar"],    answer: 2, explanation: "Jawaharlal Nehru was India's first Prime Minister (1947–1964)." },
    { id: "ih-q3", topicId: "indian-history", difficulty: "medium", question: "Battle of Plassey (1757) was fought against which Nawab?",         options: ["Tipu Sultan", "Siraj ud-Daulah", "Aurangzeb", "Shivaji"],           answer: 1, explanation: "The Battle of Plassey was fought between British East India Company and Siraj ud-Daulah." },
    { id: "ih-q4", topicId: "indian-history", difficulty: "medium", question: "Who founded the Mughal Empire in India?",                          options: ["Akbar", "Humayun", "Babur", "Shah Jahan"],                          answer: 2, explanation: "Babur founded the Mughal Empire after defeating Ibrahim Lodi at the First Battle of Panipat in 1526." },
    { id: "ih-q5", topicId: "indian-history", difficulty: "easy",   question: "The Taj Mahal was built by which Mughal emperor?",                 options: ["Akbar", "Jahangir", "Aurangzeb", "Shah Jahan"],                     answer: 3, explanation: "Shah Jahan built the Taj Mahal (1632–1653) in memory of his wife Mumtaz Mahal." },
    { id: "ih-q6", topicId: "indian-history", difficulty: "hard",   question: "The Jallianwala Bagh massacre occurred in which year?",            options: ["1915", "1917", "1919", "1921"],                                     answer: 2, explanation: "The Jallianwala Bagh massacre occurred on April 13, 1919 in Amritsar." },
    { id: "ih-q7", topicId: "indian-history", difficulty: "medium", question: "Who is known as the 'Iron Man of India'?",                         options: ["Nehru", "Ambedkar", "Sardar Patel", "Bose"],                        answer: 2, explanation: "Sardar Vallabhbhai Patel integrated 562 princely states into India." },
    { id: "ih-q8", topicId: "indian-history", difficulty: "hard",   question: "Gandhi's Dandi March protested against which tax?",                options: ["Arms tax", "Rowlatt Act", "Salt Tax", "Press Act"],                 answer: 2, explanation: "The Dandi March (March 1930) protested British salt monopoly and salt tax." },
  ],
  "geography": [
    { id: "geo-q1", topicId: "geography", difficulty: "easy",   question: "Which is the largest continent?",                          options: ["Africa", "North America", "Asia", "Europe"],            answer: 2, explanation: "Asia is the largest continent, covering ~30% of Earth's land area." },
    { id: "geo-q2", topicId: "geography", difficulty: "easy",   question: "What is the capital of Australia?",                       options: ["Sydney", "Melbourne", "Brisbane", "Canberra"],           answer: 3, explanation: "Canberra is the capital. Sydney is the largest city." },
    { id: "geo-q3", topicId: "geography", difficulty: "medium", question: "Which is the longest river in the world?",                options: ["Amazon", "Nile", "Yangtze", "Mississippi"],              answer: 1, explanation: "The Nile (6,650 km) is traditionally considered the world's longest river." },
    { id: "geo-q4", topicId: "geography", difficulty: "medium", question: "Which is the largest country by area?",                  options: ["China", "Canada", "USA", "Russia"],                      answer: 3, explanation: "Russia (17.1 million km²) is the world's largest country." },
    { id: "geo-q5", topicId: "geography", difficulty: "easy",   question: "How many states does India have?",                       options: ["25", "28", "29", "30"],                                  answer: 1, explanation: "India has 28 states and 8 Union Territories." },
    { id: "geo-q6", topicId: "geography", difficulty: "hard",   question: "Which is the largest ocean?",                           options: ["Atlantic", "Indian", "Arctic", "Pacific"],               answer: 3, explanation: "The Pacific Ocean is largest, covering more area than all land combined." },
    { id: "geo-q7", topicId: "geography", difficulty: "medium", question: "The Sahara Desert is located in which continent?",       options: ["Asia", "Africa", "Australia", "South America"],          answer: 1, explanation: "The Sahara in northern Africa is the world's largest hot desert." },
    { id: "geo-q8", topicId: "geography", difficulty: "easy",   question: "What is the capital of Japan?",                         options: ["Osaka", "Kyoto", "Tokyo", "Hiroshima"],                  answer: 2, explanation: "Tokyo is the capital and largest city of Japan." },
  ],
  "science": [
    { id: "sci-q1", topicId: "science", difficulty: "easy",   question: "What is the approximate speed of light?",          options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"],   answer: 1, explanation: "Speed of light ≈ 3 × 10⁸ m/s (300,000 km/s) in vacuum." },
    { id: "sci-q2", topicId: "science", difficulty: "easy",   question: "What does DNA stand for?",                         options: ["Deoxyribonucleic Acid", "Dinitrogen Amino Acid", "Dextrose Nucleic Acid", "Dynamic Nucleotide"], answer: 0, explanation: "DNA = Deoxyribonucleic Acid, the molecule carrying genetic information." },
    { id: "sci-q3", topicId: "science", difficulty: "medium", question: "Who created the Periodic Table?",                  options: ["Lavoisier", "Dalton", "Mendeleev", "Marie Curie"],         answer: 2, explanation: "Dmitri Mendeleev created the Periodic Table in 1869." },
    { id: "sci-q4", topicId: "science", difficulty: "medium", question: "What is the chemical formula of water?",           options: ["H₂O₂", "HO", "H₂O", "H₃O"],                              answer: 2, explanation: "Water is H₂O — two hydrogen atoms bonded to one oxygen." },
    { id: "sci-q5", topicId: "science", difficulty: "easy",   question: "What force keeps planets in orbit around the Sun?", options: ["Magnetic", "Nuclear", "Gravitational", "Electromagnetic"], answer: 2, explanation: "Gravity keeps planets in orbit around the Sun." },
    { id: "sci-q6", topicId: "science", difficulty: "hard",   question: "What is called the 'powerhouse of the cell'?",     options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"],            answer: 2, explanation: "Mitochondria produces ATP energy through cellular respiration." },
    { id: "sci-q7", topicId: "science", difficulty: "medium", question: "Newton's Second Law of Motion is?",                options: ["Inertia law", "F = ma", "Action = Reaction", "Conservation of energy"], answer: 1, explanation: "Newton's 2nd Law: F = ma (Force = Mass × Acceleration)." },
    { id: "sci-q8", topicId: "science", difficulty: "hard",   question: "Which blood group is the universal donor?",         options: ["AB+", "O-", "A+", "B-"],                                   answer: 1, explanation: "O negative (O-) is the universal donor for red blood cells." },
  ],
  "space": [
    { id: "sp-q1", topicId: "space", difficulty: "easy",   question: "Who was the first human in space?",                              options: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"],    answer: 2, explanation: "Yuri Gagarin was the first human in space on April 12, 1961." },
    { id: "sp-q2", topicId: "space", difficulty: "easy",   question: "ISRO stands for?",                                              options: ["Indian Space Research Organisation", "Indian Scientific Research Organisation", "International Space Research Organisation", "Indian Solar Research Organisation"], answer: 0, explanation: "ISRO = Indian Space Research Organisation, founded in 1969." },
    { id: "sp-q3", topicId: "space", difficulty: "medium", question: "Which was the first artificial satellite?",                     options: ["Explorer 1", "Sputnik 1", "Vanguard 1", "Luna 1"],               answer: 1, explanation: "Sputnik 1 (USSR, October 4, 1957) was the first artificial satellite." },
    { id: "sp-q4", topicId: "space", difficulty: "medium", question: "Chandrayaan-3 was the first to land near which lunar region?",  options: ["North Pole", "Equator", "South Pole", "Far side"],               answer: 2, explanation: "Chandrayaan-3 landed near the Moon's South Pole on August 23, 2023." },
    { id: "sp-q5", topicId: "space", difficulty: "easy",   question: "Which is the largest planet in our Solar System?",              options: ["Saturn", "Uranus", "Neptune", "Jupiter"],                        answer: 3, explanation: "Jupiter is the largest planet in our Solar System." },
    { id: "sp-q6", topicId: "space", difficulty: "hard",   question: "What is a light-year?",                                        options: ["Time for light to orbit Earth", "Distance light travels in one year", "Speed of light per second", "Distance Earth to Moon"], answer: 1, explanation: "A light-year is the distance light travels in one year (~9.46 × 10¹² km)." },
    { id: "sp-q7", topicId: "space", difficulty: "medium", question: "India's Mars mission is known as?",                             options: ["Chandrayaan", "Gaganyaan", "Mangalyaan", "Aditya"],              answer: 2, explanation: "India's Mars Orbiter Mission (2014) is called Mangalyaan." },
    { id: "sp-q8", topicId: "space", difficulty: "hard",   question: "Who was the first Indian in space?",                            options: ["Rakesh Sharma", "Sunita Williams", "Kalpana Chawla", "Ravish Malhotra"], answer: 0, explanation: "Rakesh Sharma flew on Soviet Soyuz T-11 in 1984 — first Indian in space." },
  ],
  "technology": [
    { id: "tech-q1", topicId: "technology", difficulty: "easy",   question: "Who invented the World Wide Web?",                        options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Vint Cerf"],      answer: 2, explanation: "Tim Berners-Lee invented the WWW in 1989 at CERN." },
    { id: "tech-q2", topicId: "technology", difficulty: "easy",   question: "What does CPU stand for?",                                options: ["Central Process Unit", "Central Processing Unit", "Computer Processing Unit", "Core Processing Unit"], answer: 1, explanation: "CPU = Central Processing Unit — the main processor in a computer." },
    { id: "tech-q3", topicId: "technology", difficulty: "medium", question: "When was Google founded?",                                options: ["1996", "1998", "2000", "2002"],                                 answer: 1, explanation: "Google was founded on September 4, 1998 by Larry Page and Sergey Brin." },
    { id: "tech-q4", topicId: "technology", difficulty: "medium", question: "Which Indian payment system processes billions monthly?",  options: ["NEFT", "RTGS", "UPI", "IMPS"],                                  answer: 2, explanation: "UPI (Unified Payments Interface) launched by NPCI in 2016." },
    { id: "tech-q5", topicId: "technology", difficulty: "easy",   question: "What does AI stand for?",                                 options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Information", "Algorithmic Integration"], answer: 1, explanation: "AI = Artificial Intelligence — simulation of human intelligence by machines." },
    { id: "tech-q6", topicId: "technology", difficulty: "hard",   question: "Which country has the most internet users?",              options: ["USA", "India", "China", "Brazil"],                              answer: 2, explanation: "China has the most internet users (~1.05 billion), India is 2nd." },
    { id: "tech-q7", topicId: "technology", difficulty: "medium", question: "HTML stands for?",                                        options: ["Hyper Text Markup Language", "High Transfer Markup Language", "Hyper Transfer Meta Language", "Hyper Text Meta Language"], answer: 0, explanation: "HTML = HyperText Markup Language — standard language for web pages." },
    { id: "tech-q8", topicId: "technology", difficulty: "hard",   question: "Moore's Law says transistors on a chip double every?",   options: ["6 months", "1 year", "2 years", "5 years"],                     answer: 2, explanation: "Moore's Law (1965): transistor counts double approximately every 2 years." },
  ],
  "environment": [
    { id: "env-q1", topicId: "environment", difficulty: "easy",   question: "Main greenhouse gas causing climate change?",        options: ["Nitrogen", "Carbon Dioxide (CO₂)", "Oxygen", "Hydrogen"],          answer: 1, explanation: "CO₂ from burning fossil fuels is the primary driver of climate change." },
    { id: "env-q2", topicId: "environment", difficulty: "easy",   question: "Paris Agreement aims to limit warming to below?",    options: ["1°C", "1.5°C", "2.5°C", "3°C"],                                    answer: 1, explanation: "The Paris Agreement (2015) targets limiting warming to 1.5°C above pre-industrial levels." },
    { id: "env-q3", topicId: "environment", difficulty: "medium", question: "Which atmospheric layer protects from UV radiation?", options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],        answer: 1, explanation: "The ozone layer in the stratosphere absorbs harmful UV-B and UV-C radiation." },
    { id: "env-q4", topicId: "environment", difficulty: "medium", question: "Where is the world's largest mangrove forest?",      options: ["Amazon Delta", "Sundarbans (India/Bangladesh)", "Congo Delta", "Mekong Delta"], answer: 1, explanation: "The Sundarbans is the world's largest mangrove forest (10,000 km²)." },
    { id: "env-q5", topicId: "environment", difficulty: "easy",   question: "Fastest-growing renewable energy source globally?",  options: ["Wind", "Solar", "Hydro", "Geothermal"],                             answer: 1, explanation: "Solar energy is the fastest-growing renewable source globally." },
    { id: "env-q6", topicId: "environment", difficulty: "hard",   question: "India's renewable energy target by 2030?",           options: ["200 GW", "350 GW", "500 GW", "750 GW"],                             answer: 2, explanation: "India targets 500 GW of renewable energy capacity by 2030." },
    { id: "env-q7", topicId: "environment", difficulty: "medium", question: "ISA was co-founded by India and which country?",     options: ["USA", "Germany", "France", "Japan"],                                answer: 2, explanation: "The International Solar Alliance was co-founded by India and France in 2015 at COP21." },
    { id: "env-q8", topicId: "environment", difficulty: "hard",   question: "Which gas has the highest global warming potential?", options: ["CO₂", "Methane (CH₄)", "Nitrous Oxide (N₂O)", "SF₆"],             answer: 3, explanation: "SF₆ has a GWP ~23,500× that of CO₂ over 100 years." },
  ],
  "economy": [
    { id: "eco-q1", topicId: "economy", difficulty: "easy",   question: "GDP stands for?",                                       options: ["Gross Domestic Product", "General Development Plan", "Government Development Program", "Gross Development Plan"], answer: 0, explanation: "GDP = Gross Domestic Product — total value of goods/services produced in a year." },
    { id: "eco-q2", topicId: "economy", difficulty: "easy",   question: "RBI was established in which year?",                   options: ["1935", "1947", "1950", "1969"],                                    answer: 0, explanation: "The Reserve Bank of India was established on April 1, 1935." },
    { id: "eco-q3", topicId: "economy", difficulty: "medium", question: "India's GST was introduced in?",                       options: ["2015", "2016", "2017", "2018"],                                    answer: 2, explanation: "GST was introduced on July 1, 2017." },
    { id: "eco-q4", topicId: "economy", difficulty: "medium", question: "Where is the World Bank headquarters?",                options: ["London", "Geneva", "New York", "Washington D.C."],                 answer: 3, explanation: "The World Bank is headquartered in Washington D.C., USA." },
    { id: "eco-q5", topicId: "economy", difficulty: "easy",   question: "India is the _____ largest economy by nominal GDP?",   options: ["3rd", "4th", "5th", "6th"],                                        answer: 2, explanation: "India is the 5th largest economy by nominal GDP (2023)." },
    { id: "eco-q6", topicId: "economy", difficulty: "hard",   question: "SEBI regulates which sector?",                        options: ["Banking", "Insurance", "Stock Market", "Real Estate"],             answer: 2, explanation: "SEBI (Securities and Exchange Board of India) regulates India's capital markets." },
    { id: "eco-q7", topicId: "economy", difficulty: "medium", question: "BRICS stands for?",                                   options: ["Brazil, Russia, India, China, South Africa", "Britain, Russia, India, China, Singapore", "Brazil, Russia, Iran, China, Saudi Arabia", "Brazil, Russia, Indonesia, China, South Africa"], answer: 0, explanation: "BRICS = Brazil, Russia, India, China, South Africa." },
    { id: "eco-q8", topicId: "economy", difficulty: "hard",   question: "India's largest public sector bank?",                 options: ["Punjab National Bank", "Bank of Baroda", "State Bank of India", "Canara Bank"], answer: 2, explanation: "State Bank of India (SBI) is India's largest public sector bank." },
  ],
  "sports": [
    { id: "spo-q1", topicId: "sports", difficulty: "easy",   question: "India won its first Cricket World Cup in which year?",          options: ["1975", "1979", "1983", "1987"],              answer: 2, explanation: "India won its first ODI Cricket World Cup in 1983 under Kapil Dev." },
    { id: "spo-q2", topicId: "sports", difficulty: "easy",   question: "Who won India's first individual Olympic gold?",                options: ["Sushil Kumar", "Vijender Singh", "Abhinav Bindra", "P.T. Usha"], answer: 2, explanation: "Abhinav Bindra won India's first individual Olympic gold at Beijing 2008." },
    { id: "spo-q3", topicId: "sports", difficulty: "medium", question: "Where were the 2024 Summer Olympics held?",                    options: ["Tokyo", "London", "Los Angeles", "Paris"],  answer: 3, explanation: "Paris hosted the 2024 Summer Olympics (July–August 2024)." },
    { id: "spo-q4", topicId: "sports", difficulty: "medium", question: "How many international centuries did Sachin Tendulkar score?", options: ["85", "95", "100", "105"],                    answer: 2, explanation: "Sachin Tendulkar scored exactly 100 international centuries — a world record." },
    { id: "spo-q5", topicId: "sports", difficulty: "easy",   question: "How often are the Olympic Games held?",                       options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], answer: 2, explanation: "The Summer and Winter Olympics are each held every 4 years." },
    { id: "spo-q6", topicId: "sports", difficulty: "hard",   question: "Which country has won FIFA World Cup most times?",             options: ["Germany", "Italy", "Argentina", "Brazil"],  answer: 3, explanation: "Brazil has won the FIFA World Cup 5 times — the most of any nation." },
    { id: "spo-q7", topicId: "sports", difficulty: "medium", question: "Neeraj Chopra won Olympic gold in which event?",              options: ["Discus throw", "Shot put", "Javelin throw", "Hammer throw"], answer: 2, explanation: "Neeraj Chopra won javelin gold at Tokyo 2020 — India's first athletics Olympic gold." },
    { id: "spo-q8", topicId: "sports", difficulty: "hard",   question: "The Olympic motto 'Citius, Altius, Fortius' means?",          options: ["Peace, Love, Unity", "Faster, Higher, Stronger", "Body, Mind, Spirit", "Excellence, Respect, Friendship"], answer: 1, explanation: "Citius, Altius, Fortius = Faster, Higher, Stronger — the Olympic motto." },
  ],
  "awards": [
    { id: "aw-q1", topicId: "awards", difficulty: "easy",   question: "India's highest civilian honour?",                                      options: ["Padma Vibhushan", "Bharat Ratna", "Param Vir Chakra", "Arjuna Award"], answer: 1, explanation: "Bharat Ratna is India's highest civilian honour, since 1954." },
    { id: "aw-q2", topicId: "awards", difficulty: "easy",   question: "First Indian Nobel Prize winner?",                                      options: ["C.V. Raman", "Amartya Sen", "Rabindranath Tagore", "Mother Teresa"],   answer: 2, explanation: "Tagore won the Nobel Prize in Literature in 1913 — first Indian laureate." },
    { id: "aw-q3", topicId: "awards", difficulty: "medium", question: "AR Rahman won Oscars for which film?",                                  options: ["Dil Se", "Lagaan", "Slumdog Millionaire", "Life of Pi"],               answer: 2, explanation: "AR Rahman won two Oscars for Slumdog Millionaire (2009)." },
    { id: "aw-q4", topicId: "awards", difficulty: "medium", question: "Who shared the 2014 Nobel Peace Prize with Kailash Satyarthi?",         options: ["Malala Yousafzai", "Narendra Modi", "Ban Ki-moon", "Angela Merkel"],   answer: 0, explanation: "Kailash Satyarthi and Malala Yousafzai jointly won the 2014 Nobel Peace Prize." },
    { id: "aw-q5", topicId: "awards", difficulty: "easy",   question: "Dadasaheb Phalke Award is given for?",                                  options: ["Literature", "Science", "Cinema", "Sports"],                           answer: 2, explanation: "Dadasaheb Phalke Award is India's highest cinema honour for lifetime contribution." },
    { id: "aw-q6", topicId: "awards", difficulty: "hard",   question: "The Pulitzer Prize is awarded in which field?",                         options: ["Cinema", "Science", "Journalism/Literature", "Music"],                 answer: 2, explanation: "The Pulitzer Prize (since 1917) recognises excellence in journalism and literature." },
    { id: "aw-q7", topicId: "awards", difficulty: "medium", question: "Who was the first sportsperson to receive Bharat Ratna?",               options: ["Milkha Singh", "P.T. Usha", "Sachin Tendulkar", "Dhyan Chand"],        answer: 2, explanation: "Sachin Tendulkar was awarded Bharat Ratna in 2014 — first sportsperson." },
    { id: "aw-q8", topicId: "awards", difficulty: "hard",   question: "The Fields Medal is highest honour in?",                                options: ["Physics", "Mathematics", "Chemistry", "Economics"],                    answer: 1, explanation: "The Fields Medal, awarded every 4 years, is the top prize in mathematics." },
  ],
  "constitution": [
    { id: "con-q1", topicId: "constitution", difficulty: "easy",   question: "Indian Constitution was adopted on?",                                       options: ["15 Aug 1947", "26 Nov 1949", "26 Jan 1950", "26 Jan 1949"],         answer: 1, explanation: "The Constitution was adopted on November 26, 1949 and came into force Jan 26, 1950." },
    { id: "con-q2", topicId: "constitution", difficulty: "easy",   question: "Who is called 'Father of Indian Constitution'?",                             options: ["Nehru", "Gandhi", "Dr. B.R. Ambedkar", "Sardar Patel"],             answer: 2, explanation: "Dr. B.R. Ambedkar was chairman of the Drafting Committee — father of the Constitution." },
    { id: "con-q3", topicId: "constitution", difficulty: "medium", question: "How many Fundamental Rights does India's Constitution guarantee?",           options: ["5", "6", "7", "8"],                                                 answer: 1, explanation: "There are 6 Fundamental Rights (7th Right to Property removed in 1978)." },
    { id: "con-q4", topicId: "constitution", difficulty: "medium", question: "Article 21 of Indian Constitution deals with?",                             options: ["Right to Equality", "Freedom of Religion", "Right to Life & Liberty", "Right to Education"], answer: 2, explanation: "Article 21 guarantees Right to Life and Personal Liberty." },
    { id: "con-q5", topicId: "constitution", difficulty: "easy",   question: "Republic Day is celebrated on?",                                             options: ["15 August", "26 January", "2 October", "14 November"],               answer: 1, explanation: "Republic Day (26 January) marks the day the Constitution came into force in 1950." },
    { id: "con-q6", topicId: "constitution", difficulty: "hard",   question: "Fundamental Duties were added by which amendment?",                         options: ["40th", "42nd", "44th", "52nd"],                                      answer: 1, explanation: "42nd Amendment (1976) added Fundamental Duties (Article 51A) to the Constitution." },
    { id: "con-q7", topicId: "constitution", difficulty: "medium", question: "Maximum members of Lok Sabha?",                                             options: ["545", "548", "550", "552"],                                          answer: 3, explanation: "Lok Sabha can have a maximum of 552 members." },
    { id: "con-q8", topicId: "constitution", difficulty: "hard",   question: "Directive Principles of State Policy were borrowed from which country?",    options: ["USA", "UK", "Ireland", "Canada"],                                    answer: 2, explanation: "Directive Principles were inspired by the Irish Constitution of 1937." },
  ],
  "current-affairs": [
    { id: "ca-q1", topicId: "current-affairs", difficulty: "easy",   question: "Ram Mandir was inaugurated in January 2024 in which city?",     options: ["Varanasi", "Mathura", "Ayodhya", "Prayagraj"],            answer: 2, explanation: "Ram Mandir was inaugurated in Ayodhya on January 22, 2024." },
    { id: "ca-q2", topicId: "current-affairs", difficulty: "easy",   question: "India hosted the G20 Summit in 2023 in which city?",           options: ["Mumbai", "New Delhi", "Bengaluru", "Hyderabad"],           answer: 1, explanation: "India hosted G20 in New Delhi, September 9–10, 2023." },
    { id: "ca-q3", topicId: "current-affairs", difficulty: "medium", question: "Chandrayaan-3 successfully landed on the Moon on?",            options: ["23 Jul 2023", "23 Aug 2023", "15 Aug 2023", "26 Nov 2023"], answer: 1, explanation: "Chandrayaan-3 Vikram lander touched down on August 23, 2023." },
    { id: "ca-q4", topicId: "current-affairs", difficulty: "medium", question: "Neeraj Chopra won which medal at Paris 2024 Olympics?",         options: ["Gold", "Silver", "Bronze", "He didn't participate"],       answer: 1, explanation: "Neeraj Chopra won Silver in javelin throw at Paris 2024 Olympics." },
    { id: "ca-q5", topicId: "current-affairs", difficulty: "easy",   question: "ChatGPT was launched by which company?",                       options: ["Google", "Meta", "OpenAI", "Microsoft"],                  answer: 2, explanation: "ChatGPT was launched by OpenAI on November 30, 2022." },
    { id: "ca-q6", topicId: "current-affairs", difficulty: "hard",   question: "India's first semiconductor fab is being set up in which state?", options: ["Maharashtra", "Karnataka", "Gujarat", "Tamil Nadu"],       answer: 2, explanation: "Tata Electronics is building India's first semiconductor fab in Gujarat (Dholera)." },
    { id: "ca-q7", topicId: "current-affairs", difficulty: "medium", question: "India aims to become a developed nation by which year?",       options: ["2035", "2040", "2047", "2050"],                             answer: 2, explanation: "Viksit Bharat (Developed India) vision targets 2047 — 100 years of independence." },
    { id: "ca-q8", topicId: "current-affairs", difficulty: "hard",   question: "India's total medal count at Paris 2024 Olympics?",            options: ["4", "6", "7", "8"],                                        answer: 1, explanation: "India won 6 medals at Paris 2024 — 1 silver (Neeraj) and 5 bronze." },
  ],
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/gk/topics
router.get("/gk/topics", (_req, res) => {
  res.json({ topics: TOPICS });
});

// GET /api/gk/quiz/:topic
router.get("/gk/quiz/:topic", (req, res) => {
  const topic = req.params.topic;
  const difficulty = req.query.difficulty as string | undefined;

  let questions = QUESTIONS[topic];
  if (!questions) {
    res.status(404).json({ error: `Topic '${topic}' not found.` });
    return;
  }

  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    questions = questions.filter((q) => q.difficulty === difficulty);
  }

  res.json({
    topic,
    topicName: TOPICS.find((t) => t.id === topic)?.name ?? topic,
    questions,
  });
});

// GET /api/gk/search?q=query
router.get("/gk/search", (req, res) => {
  const q = String(req.query.q ?? "").toLowerCase().trim();
  if (!q) {
    res.json({ results: [] });
    return;
  }

  const results: { type: "topic" | "question"; id: string; topicId: string; text: string }[] = [];

  for (const topic of TOPICS) {
    if (
      topic.name.toLowerCase().includes(q) ||
      topic.description.toLowerCase().includes(q)
    ) {
      results.push({ type: "topic", id: topic.id, topicId: topic.id, text: topic.name });
    }
  }

  for (const [topicId, questions] of Object.entries(QUESTIONS)) {
    for (const question of questions) {
      if (
        question.question.toLowerCase().includes(q) ||
        question.options.some((o) => o.toLowerCase().includes(q)) ||
        question.explanation.toLowerCase().includes(q)
      ) {
        results.push({ type: "question", id: question.id, topicId, text: question.question });
      }
    }
  }

  res.json({ results: results.slice(0, 20) });
});

export default router;
