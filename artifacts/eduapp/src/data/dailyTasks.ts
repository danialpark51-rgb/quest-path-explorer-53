export type DailyTask = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  completed: boolean;
  actionType?: "goal-videos" | "skills" | "quiz" | "stories" | "games" | "news" | "observation" | "ai" | "tasks";
  actionLabel?: string;
};

export const dailyTasks: DailyTask[] = [
  // Easy
  { id: "e1", title: "Watch 1 Short Video", description: "Watch a goal-based video matched to your selected career topic", difficulty: "Easy", xp: 10, completed: false, actionType: "goal-videos", actionLabel: "Open goal videos" },
  { id: "e2", title: "Read a Concept", description: "Open a lesson explanation inside any skill module and revise the concept", difficulty: "Easy", xp: 10, completed: false, actionType: "skills", actionLabel: "Open skills" },
  { id: "e3", title: "Complete 5-Question Quiz", description: "Take a quick level-based quiz on your chosen subject", difficulty: "Easy", xp: 15, completed: false, actionType: "quiz", actionLabel: "Open quiz" },
  { id: "e4", title: "Read 1 Story Topic", description: "Open a learning story and read the topic summary with key points", difficulty: "Easy", xp: 10, completed: false, actionType: "stories", actionLabel: "Open stories" },
  { id: "e5", title: "Play 1 Brain Game", description: "Play a logic or puzzle game from the games section", difficulty: "Easy", xp: 10, completed: false, actionType: "games", actionLabel: "Open games" },
  { id: "e6", title: "Read Today's News", description: "Read at least 2 student-friendly news articles", difficulty: "Easy", xp: 10, completed: false, actionType: "news", actionLabel: "Open news" },
  { id: "e7", title: "Observe an Image", description: "Complete one observation challenge and list what you notice", difficulty: "Easy", xp: 15, completed: false, actionType: "observation", actionLabel: "Open observation" },

  // Medium
  { id: "m1", title: "Solve 10 Questions", description: "Practice a longer quiz from your goal area", difficulty: "Medium", xp: 25, completed: false, actionType: "quiz", actionLabel: "Start quiz" },
  { id: "m2", title: "Watch 2 Videos", description: "Watch two topic-specific videos from your goal video section", difficulty: "Medium", xp: 20, completed: false, actionType: "goal-videos", actionLabel: "Open video library" },
  { id: "m3", title: "Write a Short Explanation", description: "Read a lesson, then explain it in your own words", difficulty: "Medium", xp: 30, completed: false, actionType: "skills", actionLabel: "Read lessons" },
  { id: "m4", title: "Complete 3 Skill Lessons", description: "Finish three structured lessons from one skill path", difficulty: "Medium", xp: 30, completed: false, actionType: "skills", actionLabel: "Open lesson list" },
  { id: "m5", title: "Win 2 Brain Games", description: "Play and win two different thinking games", difficulty: "Medium", xp: 25, completed: false, actionType: "games", actionLabel: "Play games" },
  { id: "m6", title: "Ask AI 3 Questions", description: "Use the study assistant to clear three doubts", difficulty: "Medium", xp: 20, completed: false, actionType: "ai", actionLabel: "Open AI assistant" },
  { id: "m7", title: "Teach Someone", description: "Use a story or lesson topic and explain it to someone else", difficulty: "Medium", xp: 35, completed: false, actionType: "stories", actionLabel: "Read story topic" },

  // Hard
  { id: "h1", title: "Full Chapter Quiz", description: "Complete a comprehensive 10+ question quiz", difficulty: "Hard", xp: 50, completed: false, actionType: "quiz", actionLabel: "Take full quiz" },
  { id: "h2", title: "Complete a Mini Project", description: "Use one skill lesson and build a small output or practice task", difficulty: "Hard", xp: 75, completed: false, actionType: "skills", actionLabel: "Open advanced lessons" },
  { id: "h3", title: "Study for 2 Hours", description: "Use goal videos, lessons, and stories for a focused long session", difficulty: "Hard", xp: 60, completed: false, actionType: "goal-videos", actionLabel: "Start study session" },
  { id: "h4", title: "Complete All Easy Tasks", description: "Finish every easy task for the day", difficulty: "Hard", xp: 50, completed: false, actionType: "tasks", actionLabel: "Track here" },
  { id: "h5", title: "Score 80%+ in Any Quiz", description: "Reach at least 80% in any level-based quiz", difficulty: "Hard", xp: 55, completed: false, actionType: "quiz", actionLabel: "Start quiz" },
  { id: "h6", title: "Observe 5 Images", description: "Complete five observation challenges carefully", difficulty: "Hard", xp: 65, completed: false, actionType: "observation", actionLabel: "Open observation" },
];
