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
  questions: QuizQuestion[];
};

export const quizzes: Quiz[] = [
  {
    id: "eng-math",
    topic: "Engineering Mathematics",
    goalId: "engineering",
    questions: [
      { id: 1, question: "What is the derivative of x²?", options: ["x", "2x", "x²", "2"], correctAnswer: 1 },
      { id: 2, question: "What is the value of π (approx)?", options: ["3.14", "2.14", "4.14", "3.41"], correctAnswer: 0 },
      { id: 3, question: "What does an integral represent?", options: ["Slope", "Area under curve", "Speed", "Distance"], correctAnswer: 1 },
      { id: 4, question: "sin(90°) = ?", options: ["0", "1", "-1", "0.5"], correctAnswer: 1 },
      { id: 5, question: "What is 2³?", options: ["6", "8", "9", "4"], correctAnswer: 1 },
      { id: 6, question: "Logarithm base 10 of 100 is?", options: ["1", "2", "10", "100"], correctAnswer: 1 },
      { id: 7, question: "A matrix with equal rows and columns is called?", options: ["Rectangular", "Square", "Diagonal", "Scalar"], correctAnswer: 1 },
      { id: 8, question: "What is the sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correctAnswer: 1 },
      { id: 9, question: "What is the Pythagorean theorem?", options: ["a+b=c", "a²+b²=c²", "a×b=c", "a/b=c"], correctAnswer: 1 },
      { id: 10, question: "What is the value of √144?", options: ["10", "11", "12", "14"], correctAnswer: 2 },
    ],
  },
  {
    id: "med-bio",
    topic: "Medical Biology",
    goalId: "medical",
    questions: [
      { id: 1, question: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"], correctAnswer: 1 },
      { id: 2, question: "DNA stands for?", options: ["Deoxyribo Nucleic Acid", "Di Nucleic Acid", "Dual Nuclear Acid", "None"], correctAnswer: 0 },
      { id: 3, question: "How many bones in adult human body?", options: ["206", "208", "204", "210"], correctAnswer: 0 },
      { id: 4, question: "Largest organ of human body?", options: ["Heart", "Liver", "Skin", "Brain"], correctAnswer: 2 },
      { id: 5, question: "Blood is filtered by which organ?", options: ["Heart", "Lungs", "Kidney", "Liver"], correctAnswer: 2 },
      { id: 6, question: "RBC stands for?", options: ["Red Blood Cells", "Right Blood Count", "Radial Blood Cells", "None"], correctAnswer: 0 },
      { id: 7, question: "Which vitamin is produced by sunlight?", options: ["A", "B", "C", "D"], correctAnswer: 3 },
      { id: 8, question: "How many chambers does the heart have?", options: ["2", "3", "4", "5"], correctAnswer: 2 },
      { id: 9, question: "Photosynthesis occurs in?", options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], correctAnswer: 1 },
      { id: 10, question: "Insulin is produced by?", options: ["Liver", "Pancreas", "Kidney", "Stomach"], correctAnswer: 1 },
    ],
  },
  {
    id: "upsc-gk",
    topic: "UPSC General Knowledge",
    goalId: "govt",
    questions: [
      { id: 1, question: "Who is known as the Father of the Indian Constitution?", options: ["Gandhi", "Nehru", "Ambedkar", "Patel"], correctAnswer: 2 },
      { id: 2, question: "How many fundamental rights are there?", options: ["5", "6", "7", "8"], correctAnswer: 1 },
      { id: 3, question: "Who was the first President of India?", options: ["Nehru", "Rajendra Prasad", "Ambedkar", "Patel"], correctAnswer: 1 },
      { id: 4, question: "Which article abolishes untouchability?", options: ["14", "15", "17", "19"], correctAnswer: 2 },
      { id: 5, question: "The Rajya Sabha has how many members?", options: ["200", "245", "250", "300"], correctAnswer: 2 },
      { id: 6, question: "Capital of Arunachal Pradesh?", options: ["Kohima", "Itanagar", "Shillong", "Imphal"], correctAnswer: 1 },
      { id: 7, question: "Largest state by area in India?", options: ["UP", "MP", "Rajasthan", "Maharashtra"], correctAnswer: 2 },
      { id: 8, question: "Indian National Congress founded in?", options: ["1885", "1890", "1900", "1857"], correctAnswer: 0 },
      { id: 9, question: "Who gave the slogan 'Do or Die'?", options: ["Nehru", "Gandhi", "Bose", "Tilak"], correctAnswer: 1 },
      { id: 10, question: "Quit India Movement was in which year?", options: ["1940", "1942", "1945", "1947"], correctAnswer: 1 },
      { id: 11, question: "Right to Education is which article?", options: ["21", "21A", "19", "14"], correctAnswer: 1 },
      { id: 12, question: "Who appoints the Chief Justice of India?", options: ["PM", "President", "Parliament", "Governor"], correctAnswer: 1 },
    ],
  },
  {
    id: "comm-biz",
    topic: "Commerce & Business",
    goalId: "commerce",
    questions: [
      { id: 1, question: "GDP stands for?", options: ["Gross Domestic Product", "General Domestic Product", "Gross Direct Product", "None"], correctAnswer: 0 },
      { id: 2, question: "Who is the father of Economics?", options: ["Keynes", "Adam Smith", "Marx", "Ricardo"], correctAnswer: 1 },
      { id: 3, question: "What is inflation?", options: ["Price decrease", "Price increase", "No change", "Market crash"], correctAnswer: 1 },
      { id: 4, question: "What does CA stand for?", options: ["Chartered Accountant", "Chief Administrator", "Corporate Account", "None"], correctAnswer: 0 },
      { id: 5, question: "Stock market is also called?", options: ["Bond market", "Equity market", "Money market", "Forex"], correctAnswer: 1 },
      { id: 6, question: "Balance sheet shows?", options: ["Profit only", "Loss only", "Assets & Liabilities", "Revenue"], correctAnswer: 2 },
      { id: 7, question: "Marketing mix has how many P's?", options: ["3", "4", "5", "6"], correctAnswer: 1 },
      { id: 8, question: "ROI stands for?", options: ["Return on Investment", "Rate of Interest", "Return on Income", "None"], correctAnswer: 0 },
      { id: 9, question: "What is a startup?", options: ["Old company", "New business venture", "Government org", "NGO"], correctAnswer: 1 },
      { id: 10, question: "GST stands for?", options: ["General Sales Tax", "Goods and Services Tax", "Government Service Tax", "None"], correctAnswer: 1 },
    ],
  },
  {
    id: "it-basics",
    topic: "IT & Computing",
    goalId: "it",
    questions: [
      { id: 1, question: "HTML stands for?", options: ["HyperText Markup Language", "High Text Machine Language", "Hyper Tool Multi Language", "None"], correctAnswer: 0 },
      { id: 2, question: "CPU stands for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "None"], correctAnswer: 0 },
      { id: 3, question: "Which language is used for web styling?", options: ["HTML", "CSS", "Python", "Java"], correctAnswer: 1 },
      { id: 4, question: "RAM stands for?", options: ["Read Access Memory", "Random Access Memory", "Run Application Memory", "None"], correctAnswer: 1 },
      { id: 5, question: "What is an algorithm?", options: ["A bug", "A step-by-step procedure", "A language", "A hardware"], correctAnswer: 1 },
      { id: 6, question: "Python is a?", options: ["Snake", "Programming language", "Database", "Browser"], correctAnswer: 1 },
      { id: 7, question: "What is a URL?", options: ["Web address", "Software", "Hardware", "Database"], correctAnswer: 0 },
      { id: 8, question: "Binary uses which digits?", options: ["0 and 1", "1 and 2", "0 to 9", "A to F"], correctAnswer: 0 },
      { id: 9, question: "What does AI stand for?", options: ["Auto Intelligence", "Artificial Intelligence", "Applied Information", "None"], correctAnswer: 1 },
      { id: 10, question: "Linux is a?", options: ["Browser", "Database", "Operating System", "Language"], correctAnswer: 2 },
    ],
  },
  {
    id: "def-gk",
    topic: "Defence Knowledge",
    goalId: "defence",
    questions: [
      { id: 1, question: "NDA stands for?", options: ["National Defence Academy", "National Defence Authority", "Naval Defence Academy", "None"], correctAnswer: 0 },
      { id: 2, question: "Where is NDA located?", options: ["Delhi", "Pune", "Chennai", "Dehradun"], correctAnswer: 1 },
      { id: 3, question: "Indian Army Day is on?", options: ["15 Jan", "26 Jan", "15 Aug", "1 Dec"], correctAnswer: 0 },
      { id: 4, question: "Who is the Supreme Commander of Indian Armed Forces?", options: ["PM", "President", "Army Chief", "Defence Minister"], correctAnswer: 1 },
      { id: 5, question: "Param Vir Chakra is for?", options: ["Bravery", "Sports", "Science", "Arts"], correctAnswer: 0 },
      { id: 6, question: "How many ranks in Indian Army officer cadre?", options: ["7", "9", "11", "13"], correctAnswer: 2 },
      { id: 7, question: "Indian Navy motto is?", options: ["Service Before Self", "Sham No Varunah", "Touch the Sky", "None"], correctAnswer: 1 },
      { id: 8, question: "IMA is located in?", options: ["Pune", "Dehradun", "Chennai", "Delhi"], correctAnswer: 1 },
      { id: 9, question: "CDS exam is conducted by?", options: ["NDA", "UPSC", "SSC", "Defence Ministry"], correctAnswer: 1 },
      { id: 10, question: "Air Force Day is on?", options: ["8 Oct", "4 Dec", "15 Jan", "26 Jan"], correctAnswer: 0 },
    ],
  },
  {
    id: "arts-gk",
    topic: "Arts & Humanities",
    goalId: "arts",
    questions: [
      { id: 1, question: "Psychology is the study of?", options: ["Mind & behavior", "History", "Geography", "Biology"], correctAnswer: 0 },
      { id: 2, question: "Who wrote 'The Republic'?", options: ["Aristotle", "Plato", "Socrates", "Homer"], correctAnswer: 1 },
      { id: 3, question: "Mona Lisa was painted by?", options: ["Picasso", "Da Vinci", "Van Gogh", "Monet"], correctAnswer: 1 },
      { id: 4, question: "Journalism is also called?", options: ["Fourth Estate", "Fifth Estate", "Third Pillar", "None"], correctAnswer: 0 },
      { id: 5, question: "Sociology is the study of?", options: ["Rocks", "Society", "Stars", "Numbers"], correctAnswer: 1 },
      { id: 6, question: "CLAT is for admission to?", options: ["Medical", "Law", "Engineering", "Arts"], correctAnswer: 1 },
      { id: 7, question: "Which is a classical language of India?", options: ["Hindi", "Tamil", "Marathi", "Gujarati"], correctAnswer: 1 },
      { id: 8, question: "Renaissance means?", options: ["Rebirth", "Revolution", "Reform", "Return"], correctAnswer: 0 },
      { id: 9, question: "Bharatanatyam originated from?", options: ["Kerala", "Tamil Nadu", "Karnataka", "AP"], correctAnswer: 1 },
      { id: 10, question: "Nobel Prize in Literature 2023 went to?", options: ["Jon Fosse", "Salman Rushdie", "Haruki Murakami", "None"], correctAnswer: 0 },
    ],
  },
];
