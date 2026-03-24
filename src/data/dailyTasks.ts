export type DailyTask = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  completed: boolean;
};

export const dailyTasks: DailyTask[] = [
  { id: "e1", title: "Watch 1 Short Video", description: "Watch any video from your goal library", difficulty: "Easy", xp: 10, completed: false },
  { id: "e2", title: "Read a Concept", description: "Read one lesson from any skill module", difficulty: "Easy", xp: 10, completed: false },
  { id: "e3", title: "Complete 5-Question Quiz", description: "Take a quick quiz on any topic", difficulty: "Easy", xp: 15, completed: false },
  { id: "m1", title: "Solve 10 Questions", description: "Practice problems from your goal area", difficulty: "Medium", xp: 25, completed: false },
  { id: "m2", title: "Watch 2 Videos", description: "Watch two educational videos back-to-back", difficulty: "Medium", xp: 20, completed: false },
  { id: "m3", title: "Write a Short Explanation", description: "Explain a concept in your own words", difficulty: "Medium", xp: 30, completed: false },
  { id: "h1", title: "Full Chapter Quiz", description: "Complete a comprehensive 10+ question quiz", difficulty: "Hard", xp: 50, completed: false },
  { id: "h2", title: "Complete a Mini Project", description: "Build or create something related to your skill", difficulty: "Hard", xp: 75, completed: false },
];
