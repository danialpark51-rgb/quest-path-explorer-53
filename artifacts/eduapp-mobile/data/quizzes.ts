export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export type Quiz = {
  id: string;
  topic: string;
  goalId: string;
  level: "Easy" | "Medium" | "Hard";
  questions: QuizQuestion[];
};

export const quizzes: Quiz[] = [
  {
    id: "eng-math-easy",
    topic: "Engineering Math – Easy",
    goalId: "engineering",
    level: "Easy",
    questions: [
      { id: 1, question: "What is the derivative of x²?", options: ["x", "2x", "x²", "2"], correctAnswer: 1 },
      { id: 2, question: "What is the value of π (approx)?", options: ["3.14", "2.14", "4.14", "3.41"], correctAnswer: 0 },
      { id: 3, question: "sin(90°) = ?", options: ["0", "1", "-1", "0.5"], correctAnswer: 1 },
      { id: 4, question: "What is 2³?", options: ["6", "8", "9", "4"], correctAnswer: 1 },
      { id: 5, question: "Sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correctAnswer: 1 },
    ],
  },
  {
    id: "eng-physics",
    topic: "Engineering Physics",
    goalId: "engineering",
    level: "Medium",
    questions: [
      { id: 1, question: "Unit of force is?", options: ["Joule", "Newton", "Watt", "Pascal"], correctAnswer: 1 },
      { id: 2, question: "Speed of light is approximately?", options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correctAnswer: 0 },
      { id: 3, question: "F = m × a is Newton's which law?", options: ["First", "Second", "Third", "Fourth"], correctAnswer: 1 },
      { id: 4, question: "SI unit of energy is?", options: ["Newton", "Watt", "Joule", "Pascal"], correctAnswer: 2 },
      { id: 5, question: "Acceleration due to gravity?", options: ["9.8 m/s²", "10.8 m/s²", "8.9 m/s²", "11 m/s²"], correctAnswer: 0 },
    ],
  },
  {
    id: "med-biology-easy",
    topic: "Biology Basics – Easy",
    goalId: "medical",
    level: "Easy",
    questions: [
      { id: 1, question: "Basic unit of life is?", options: ["Organ", "Cell", "Tissue", "Atom"], correctAnswer: 1 },
      { id: 2, question: "Photosynthesis produces?", options: ["CO₂", "O₂", "N₂", "H₂"], correctAnswer: 1 },
      { id: 3, question: "DNA stands for?", options: ["Deoxyribonucleic Acid", "Direct Nucleic Acid", "Dual Nucleic Acid", "Dynamic Nucleic Acid"], correctAnswer: 0 },
      { id: 4, question: "Human heart has how many chambers?", options: ["2", "3", "4", "5"], correctAnswer: 2 },
      { id: 5, question: "Largest organ of human body?", options: ["Liver", "Lung", "Skin", "Brain"], correctAnswer: 2 },
    ],
  },
  {
    id: "med-anatomy",
    topic: "Human Anatomy",
    goalId: "medical",
    level: "Medium",
    questions: [
      { id: 1, question: "Which blood type is universal donor?", options: ["A", "B", "O", "AB"], correctAnswer: 2 },
      { id: 2, question: "How many bones in adult human body?", options: ["196", "206", "216", "226"], correctAnswer: 1 },
      { id: 3, question: "Which vitamin is produced by sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correctAnswer: 3 },
      { id: 4, question: "The powerhouse of the cell is?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correctAnswer: 2 },
      { id: 5, question: "Normal human body temperature?", options: ["35°C", "36°C", "37°C", "38°C"], correctAnswer: 2 },
    ],
  },
  {
    id: "comm-economics",
    topic: "Economics Basics",
    goalId: "commerce",
    level: "Easy",
    questions: [
      { id: 1, question: "GDP stands for?", options: ["Gross Domestic Product", "General Domestic Product", "Gross Daily Price", "General Daily Product"], correctAnswer: 0 },
      { id: 2, question: "Inflation means prices are?", options: ["Falling", "Rising", "Stable", "Unpredictable"], correctAnswer: 1 },
      { id: 3, question: "A budget surplus means?", options: ["More spending than income", "More income than spending", "Equal income and spending", "No income"], correctAnswer: 1 },
      { id: 4, question: "Stock market is a place to?", options: ["Buy groceries", "Buy and sell shares", "Pay taxes", "Take loans"], correctAnswer: 1 },
      { id: 5, question: "Central bank of India is?", options: ["SBI", "HDFC", "RBI", "ICICI"], correctAnswer: 2 },
    ],
  },
  {
    id: "it-coding",
    topic: "Coding Fundamentals",
    goalId: "it",
    level: "Easy",
    questions: [
      { id: 1, question: "HTML stands for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Method Language"], correctAnswer: 0 },
      { id: 2, question: "Which language is used for web styling?", options: ["HTML", "CSS", "Python", "Java"], correctAnswer: 1 },
      { id: 3, question: "CPU stands for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Core Processing Unit"], correctAnswer: 0 },
      { id: 4, question: "What does RAM stand for?", options: ["Random Access Memory", "Read All Memory", "Rapid Access Module", "Rigid Access Memory"], correctAnswer: 0 },
      { id: 5, question: "Which of these is a programming language?", options: ["Google", "Excel", "Python", "Zoom"], correctAnswer: 2 },
    ],
  },
  {
    id: "upsc-gk",
    topic: "General Knowledge",
    goalId: "govt",
    level: "Easy",
    questions: [
      { id: 1, question: "Capital of India?", options: ["Mumbai", "Chennai", "New Delhi", "Kolkata"], correctAnswer: 2 },
      { id: 2, question: "Who is the Father of the Nation of India?", options: ["Nehru", "Gandhi", "Patel", "Bose"], correctAnswer: 1 },
      { id: 3, question: "India's national bird is?", options: ["Sparrow", "Eagle", "Peacock", "Parrot"], correctAnswer: 2 },
      { id: 4, question: "India got independence in?", options: ["1945", "1946", "1947", "1948"], correctAnswer: 2 },
      { id: 5, question: "Longest river in India?", options: ["Ganga", "Godavari", "Yamuna", "Brahmaputra"], correctAnswer: 0 },
    ],
  },
  {
    id: "arts-history",
    topic: "History & Culture",
    goalId: "arts",
    level: "Easy",
    questions: [
      { id: 1, question: "The Taj Mahal was built by?", options: ["Akbar", "Humayun", "Shah Jahan", "Aurangzeb"], correctAnswer: 2 },
      { id: 2, question: "Which is the oldest civilization?", options: ["Greek", "Roman", "Indus Valley", "Egyptian"], correctAnswer: 2 },
      { id: 3, question: "The Renaissance began in?", options: ["France", "Italy", "Germany", "Spain"], correctAnswer: 1 },
      { id: 4, question: "The first World War started in?", options: ["1912", "1913", "1914", "1915"], correctAnswer: 2 },
      { id: 5, question: "The United Nations was founded in?", options: ["1943", "1944", "1945", "1946"], correctAnswer: 2 },
    ],
  },
];
