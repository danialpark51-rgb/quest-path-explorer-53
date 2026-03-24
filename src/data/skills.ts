export type Lesson = {
  id: number;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  completed: boolean;
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
    icon: "💻",
    description: "Learn programming fundamentals from scratch",
    lessons: [
      { id: 1, title: "What is Programming?", level: "Beginner", duration: "15 min", completed: false },
      { id: 2, title: "Understanding Algorithms", level: "Beginner", duration: "20 min", completed: false },
      { id: 3, title: "Hello World Coding", level: "Beginner", duration: "10 min", completed: false },
      { id: 4, title: "Variables & Data Types", level: "Beginner", duration: "25 min", completed: false },
      { id: 5, title: "Conditions & If-Else", level: "Intermediate", duration: "20 min", completed: false },
      { id: 6, title: "Loops", level: "Intermediate", duration: "25 min", completed: false },
      { id: 7, title: "Functions", level: "Intermediate", duration: "20 min", completed: false },
      { id: 8, title: "Debugging", level: "Intermediate", duration: "15 min", completed: false },
      { id: 9, title: "Mini Project", level: "Advanced", duration: "45 min", completed: false },
      { id: 10, title: "Build a Simple Game", level: "Advanced", duration: "60 min", completed: false },
    ],
  },
  {
    id: "critical-thinking",
    title: "Critical Thinking",
    icon: "🧠",
    description: "Sharpen your analytical and reasoning abilities",
    lessons: [
      { id: 1, title: "What is Critical Thinking?", level: "Beginner", duration: "10 min", completed: false },
      { id: 2, title: "Asking the Right Questions", level: "Beginner", duration: "15 min", completed: false },
      { id: 3, title: "Identifying Bias", level: "Beginner", duration: "15 min", completed: false },
      { id: 4, title: "Logical Fallacies", level: "Beginner", duration: "20 min", completed: false },
      { id: 5, title: "Evidence Evaluation", level: "Intermediate", duration: "20 min", completed: false },
      { id: 6, title: "Argument Analysis", level: "Intermediate", duration: "25 min", completed: false },
      { id: 7, title: "Decision Making", level: "Intermediate", duration: "20 min", completed: false },
      { id: 8, title: "Problem Deconstruction", level: "Intermediate", duration: "25 min", completed: false },
      { id: 9, title: "Real-World Case Studies", level: "Advanced", duration: "30 min", completed: false },
      { id: 10, title: "Build Your Own Argument", level: "Advanced", duration: "35 min", completed: false },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    icon: "🗣️",
    description: "Master speaking, writing, and presenting",
    lessons: [
      { id: 1, title: "Basics of Communication", level: "Beginner", duration: "10 min", completed: false },
      { id: 2, title: "Active Listening", level: "Beginner", duration: "12 min", completed: false },
      { id: 3, title: "Body Language", level: "Beginner", duration: "15 min", completed: false },
      { id: 4, title: "Public Speaking Intro", level: "Beginner", duration: "20 min", completed: false },
      { id: 5, title: "Writing Clearly", level: "Intermediate", duration: "20 min", completed: false },
      { id: 6, title: "Storytelling Skills", level: "Intermediate", duration: "25 min", completed: false },
      { id: 7, title: "Debate & Discussion", level: "Intermediate", duration: "20 min", completed: false },
      { id: 8, title: "Email & Formal Writing", level: "Intermediate", duration: "15 min", completed: false },
      { id: 9, title: "Presentation Skills", level: "Advanced", duration: "30 min", completed: false },
      { id: 10, title: "Persuasion Techniques", level: "Advanced", duration: "25 min", completed: false },
    ],
  },
  {
    id: "time-management",
    title: "Time Management",
    icon: "⏰",
    description: "Learn to manage your time like a pro",
    lessons: [
      { id: 1, title: "Why Time Management?", level: "Beginner", duration: "10 min", completed: false },
      { id: 2, title: "Setting Priorities", level: "Beginner", duration: "12 min", completed: false },
      { id: 3, title: "Daily Planning", level: "Beginner", duration: "15 min", completed: false },
      { id: 4, title: "Pomodoro Technique", level: "Beginner", duration: "10 min", completed: false },
      { id: 5, title: "Overcoming Procrastination", level: "Intermediate", duration: "20 min", completed: false },
      { id: 6, title: "Study Scheduling", level: "Intermediate", duration: "25 min", completed: false },
      { id: 7, title: "Goal Setting (SMART)", level: "Intermediate", duration: "20 min", completed: false },
      { id: 8, title: "Handling Distractions", level: "Intermediate", duration: "15 min", completed: false },
      { id: 9, title: "Weekly Review System", level: "Advanced", duration: "20 min", completed: false },
      { id: 10, title: "Building Habits", level: "Advanced", duration: "25 min", completed: false },
    ],
  },
  {
    id: "creativity",
    title: "Creativity",
    icon: "🎨",
    description: "Unlock your creative potential",
    lessons: [
      { id: 1, title: "What is Creativity?", level: "Beginner", duration: "10 min", completed: false },
      { id: 2, title: "Brainstorming Techniques", level: "Beginner", duration: "15 min", completed: false },
      { id: 3, title: "Thinking Outside the Box", level: "Beginner", duration: "15 min", completed: false },
      { id: 4, title: "Mind Mapping", level: "Beginner", duration: "12 min", completed: false },
      { id: 5, title: "Creative Problem Solving", level: "Intermediate", duration: "20 min", completed: false },
      { id: 6, title: "Design Thinking", level: "Intermediate", duration: "25 min", completed: false },
      { id: 7, title: "Innovation vs Invention", level: "Intermediate", duration: "15 min", completed: false },
      { id: 8, title: "Creative Writing", level: "Intermediate", duration: "20 min", completed: false },
      { id: 9, title: "Building a Portfolio", level: "Advanced", duration: "30 min", completed: false },
      { id: 10, title: "Creative Project", level: "Advanced", duration: "45 min", completed: false },
    ],
  },
  {
    id: "digital-literacy",
    title: "Digital Literacy",
    icon: "🌐",
    description: "Navigate the digital world safely and effectively",
    lessons: [
      { id: 1, title: "Internet Basics", level: "Beginner", duration: "10 min", completed: false },
      { id: 2, title: "Online Safety", level: "Beginner", duration: "15 min", completed: false },
      { id: 3, title: "Using Search Engines", level: "Beginner", duration: "10 min", completed: false },
      { id: 4, title: "Social Media Literacy", level: "Beginner", duration: "15 min", completed: false },
      { id: 5, title: "Digital Footprint", level: "Intermediate", duration: "20 min", completed: false },
      { id: 6, title: "Fact Checking", level: "Intermediate", duration: "20 min", completed: false },
      { id: 7, title: "Productivity Tools", level: "Intermediate", duration: "25 min", completed: false },
      { id: 8, title: "Online Collaboration", level: "Intermediate", duration: "15 min", completed: false },
      { id: 9, title: "Digital Ethics", level: "Advanced", duration: "20 min", completed: false },
      { id: 10, title: "Building Online Presence", level: "Advanced", duration: "25 min", completed: false },
    ],
  },
];
