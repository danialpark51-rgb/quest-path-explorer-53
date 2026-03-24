export type DailyTask = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  completed: boolean;
};

export const dailyTasks: DailyTask[] = [
  // Easy
  { id: "e1", title: "Watch 1 Short Video", description: "Watch any video from your goal library", difficulty: "Easy", xp: 10, completed: false },
  { id: "e2", title: "Read a Concept", description: "Read one lesson from any skill module", difficulty: "Easy", xp: 10, completed: false },
  { id: "e3", title: "Complete 5-Question Quiz", description: "Take a quick quiz on any topic", difficulty: "Easy", xp: 15, completed: false },
  { id: "e4", title: "Listen to 1 Audio Story", description: "Listen to any audio story from the library", difficulty: "Easy", xp: 10, completed: false },
  { id: "e5", title: "Play 1 Brain Game", description: "Play any game from the games section", difficulty: "Easy", xp: 10, completed: false },
  { id: "e6", title: "Read Today's News", description: "Read at least 2 news articles", difficulty: "Easy", xp: 10, completed: false },
  { id: "e7", title: "Observe an Image", description: "Complete one observation challenge", difficulty: "Easy", xp: 15, completed: false },

  // Medium
  { id: "m1", title: "Solve 10 Questions", description: "Practice problems from your goal area", difficulty: "Medium", xp: 25, completed: false },
  { id: "m2", title: "Watch 2 Videos", description: "Watch two educational videos back-to-back", difficulty: "Medium", xp: 20, completed: false },
  { id: "m3", title: "Write a Short Explanation", description: "Explain a concept in your own words", difficulty: "Medium", xp: 30, completed: false },
  { id: "m4", title: "Complete 3 Skill Lessons", description: "Finish 3 lessons in any skill module", difficulty: "Medium", xp: 30, completed: false },
  { id: "m5", title: "Win 2 Brain Games", description: "Win at least 2 different brain games", difficulty: "Medium", xp: 25, completed: false },
  { id: "m6", title: "Ask AI 3 Questions", description: "Use the AI assistant to clarify 3 doubts", difficulty: "Medium", xp: 20, completed: false },
  { id: "m7", title: "Teach Someone", description: "Teach a concept you learned to a friend or family", difficulty: "Medium", xp: 35, completed: false },

  // Hard
  { id: "h1", title: "Full Chapter Quiz", description: "Complete a comprehensive 10+ question quiz", difficulty: "Hard", xp: 50, completed: false },
  { id: "h2", title: "Complete a Mini Project", description: "Build or create something related to your skill", difficulty: "Hard", xp: 75, completed: false },
  { id: "h3", title: "Study for 2 Hours", description: "Dedicate 2 focused hours to your goal", difficulty: "Hard", xp: 60, completed: false },
  { id: "h4", title: "Complete All Easy Tasks", description: "Finish every easy task for the day", difficulty: "Hard", xp: 50, completed: false },
  { id: "h5", title: "Score 80%+ in Any Quiz", description: "Get at least 80% marks in any quiz", difficulty: "Hard", xp: 55, completed: false },
  { id: "h6", title: "Observe 5 Images", description: "Complete 5 observation challenges", difficulty: "Hard", xp: 65, completed: false },
];
