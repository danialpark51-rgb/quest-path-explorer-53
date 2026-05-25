export type Lesson = {
  id: number;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
};

export type Skill = {
  id: string;
  title: string;
  icon: string;
  description: string;
  lessons: Lesson[];
};

export const skills: Skill[] = [
  {
    id: "coding",
    title: "Coding Basics",
    icon: "code-slash",
    description: "Learn programming fundamentals from scratch",
    lessons: [
      { id: 1, title: "What is Programming?", level: "Beginner", duration: "15 min" },
      { id: 2, title: "Understanding Algorithms", level: "Beginner", duration: "20 min" },
      { id: 3, title: "Hello World Coding", level: "Beginner", duration: "10 min" },
      { id: 4, title: "Variables & Data Types", level: "Beginner", duration: "25 min" },
      { id: 5, title: "Conditions & If-Else", level: "Intermediate", duration: "20 min" },
      { id: 6, title: "Loops", level: "Intermediate", duration: "25 min" },
      { id: 7, title: "Functions", level: "Intermediate", duration: "20 min" },
      { id: 8, title: "Debugging", level: "Intermediate", duration: "15 min" },
      { id: 9, title: "Mini Project", level: "Advanced", duration: "45 min" },
      { id: 10, title: "Build a Simple Game", level: "Advanced", duration: "60 min" },
    ],
  },
  {
    id: "critical-thinking",
    title: "Critical Thinking",
    icon: "bulb",
    description: "Sharpen your analytical and reasoning abilities",
    lessons: [
      { id: 1, title: "What is Critical Thinking?", level: "Beginner", duration: "10 min" },
      { id: 2, title: "Asking the Right Questions", level: "Beginner", duration: "15 min" },
      { id: 3, title: "Identifying Bias", level: "Beginner", duration: "15 min" },
      { id: 4, title: "Logical Fallacies", level: "Beginner", duration: "20 min" },
      { id: 5, title: "Evidence Evaluation", level: "Intermediate", duration: "20 min" },
      { id: 6, title: "Argument Analysis", level: "Intermediate", duration: "25 min" },
      { id: 7, title: "Decision Making", level: "Intermediate", duration: "20 min" },
      { id: 8, title: "Problem Deconstruction", level: "Intermediate", duration: "25 min" },
      { id: 9, title: "Real-World Case Studies", level: "Advanced", duration: "30 min" },
      { id: 10, title: "Build Your Own Argument", level: "Advanced", duration: "35 min" },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    icon: "chatbubbles",
    description: "Master speaking, writing, and presenting",
    lessons: [
      { id: 1, title: "Basics of Communication", level: "Beginner", duration: "10 min" },
      { id: 2, title: "Body Language Basics", level: "Beginner", duration: "15 min" },
      { id: 3, title: "Active Listening", level: "Beginner", duration: "10 min" },
      { id: 4, title: "Public Speaking Basics", level: "Intermediate", duration: "20 min" },
      { id: 5, title: "Writing Clearly", level: "Intermediate", duration: "25 min" },
      { id: 6, title: "Email Communication", level: "Intermediate", duration: "15 min" },
      { id: 7, title: "Group Discussions", level: "Intermediate", duration: "20 min" },
      { id: 8, title: "Storytelling for Impact", level: "Advanced", duration: "25 min" },
      { id: 9, title: "Leadership Communication", level: "Advanced", duration: "30 min" },
      { id: 10, title: "Negotiation Basics", level: "Advanced", duration: "35 min" },
    ],
  },
  {
    id: "math",
    title: "Mathematics",
    icon: "calculator",
    description: "Build a strong foundation in numbers and logic",
    lessons: [
      { id: 1, title: "Number Systems", level: "Beginner", duration: "20 min" },
      { id: 2, title: "Fractions & Percentages", level: "Beginner", duration: "20 min" },
      { id: 3, title: "Algebra Basics", level: "Beginner", duration: "25 min" },
      { id: 4, title: "Geometry Fundamentals", level: "Beginner", duration: "25 min" },
      { id: 5, title: "Ratios and Proportions", level: "Intermediate", duration: "20 min" },
      { id: 6, title: "Statistics Basics", level: "Intermediate", duration: "25 min" },
      { id: 7, title: "Probability", level: "Intermediate", duration: "20 min" },
      { id: 8, title: "Trigonometry", level: "Intermediate", duration: "30 min" },
      { id: 9, title: "Calculus Introduction", level: "Advanced", duration: "40 min" },
      { id: 10, title: "Problem-Solving Strategies", level: "Advanced", duration: "30 min" },
    ],
  },
  {
    id: "science",
    title: "Science Essentials",
    icon: "flask",
    description: "Explore physics, chemistry, and biology concepts",
    lessons: [
      { id: 1, title: "What is Science?", level: "Beginner", duration: "10 min" },
      { id: 2, title: "Scientific Method", level: "Beginner", duration: "15 min" },
      { id: 3, title: "Forces & Motion", level: "Beginner", duration: "20 min" },
      { id: 4, title: "Atoms & Molecules", level: "Beginner", duration: "20 min" },
      { id: 5, title: "Cell Biology", level: "Intermediate", duration: "25 min" },
      { id: 6, title: "Electricity & Circuits", level: "Intermediate", duration: "25 min" },
      { id: 7, title: "Chemical Reactions", level: "Intermediate", duration: "20 min" },
      { id: 8, title: "Human Body Systems", level: "Intermediate", duration: "30 min" },
      { id: 9, title: "Ecology", level: "Advanced", duration: "25 min" },
      { id: 10, title: "Scientific Experiments", level: "Advanced", duration: "45 min" },
    ],
  },
  {
    id: "mindfulness",
    title: "Mindfulness & Focus",
    icon: "heart",
    description: "Improve your concentration and mental well-being",
    lessons: [
      { id: 1, title: "What is Mindfulness?", level: "Beginner", duration: "10 min" },
      { id: 2, title: "Breathing Techniques", level: "Beginner", duration: "10 min" },
      { id: 3, title: "Focus & Attention", level: "Beginner", duration: "15 min" },
      { id: 4, title: "Managing Stress", level: "Intermediate", duration: "20 min" },
      { id: 5, title: "Study Habits", level: "Intermediate", duration: "20 min" },
      { id: 6, title: "Time Management", level: "Intermediate", duration: "25 min" },
      { id: 7, title: "Goal Setting", level: "Intermediate", duration: "20 min" },
      { id: 8, title: "Positive Mindset", level: "Advanced", duration: "25 min" },
      { id: 9, title: "Dealing with Failure", level: "Advanced", duration: "20 min" },
      { id: 10, title: "Daily Habits of Champions", level: "Advanced", duration: "30 min" },
    ],
  },
];
