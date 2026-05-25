export type DailyTask = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
};

export const dailyTasks: DailyTask[] = [
  { id: "e1", title: "Watch a Short Video", description: "Watch a goal-based video matched to your career topic", difficulty: "Easy", xp: 10 },
  { id: "e2", title: "Read a Concept", description: "Open a lesson inside any skill module and revise the concept", difficulty: "Easy", xp: 10 },
  { id: "e3", title: "Complete a 5-Question Quiz", description: "Take a quick level-based quiz on your chosen subject", difficulty: "Easy", xp: 15 },
  { id: "e4", title: "Read 1 Story Topic", description: "Open a learning story and read the summary with key points", difficulty: "Easy", xp: 10 },
  { id: "e5", title: "Play 1 Brain Game", description: "Play a logic or puzzle game from the games section", difficulty: "Easy", xp: 10 },
  { id: "e6", title: "Read Today's News", description: "Read at least 2 student-friendly news articles", difficulty: "Easy", xp: 10 },
  { id: "e7", title: "Observe an Image", description: "Complete one observation challenge and list what you notice", difficulty: "Easy", xp: 15 },
  { id: "m1", title: "Solve 10 Questions", description: "Practice a longer quiz from your goal area", difficulty: "Medium", xp: 25 },
  { id: "m2", title: "Watch 2 Videos", description: "Watch two topic-specific videos from your goal video section", difficulty: "Medium", xp: 20 },
  { id: "m3", title: "Write a Short Explanation", description: "Read a lesson, then explain it in your own words", difficulty: "Medium", xp: 30 },
  { id: "m4", title: "Complete 3 Skill Lessons", description: "Finish three structured lessons from one skill path", difficulty: "Medium", xp: 30 },
  { id: "m5", title: "Win 2 Brain Games", description: "Play and win two different thinking games", difficulty: "Medium", xp: 25 },
  { id: "h1", title: "Full Chapter Quiz", description: "Complete a comprehensive 10+ question quiz", difficulty: "Hard", xp: 50 },
  { id: "h2", title: "Complete a Mini Project", description: "Use one skill lesson and build a small output or practice task", difficulty: "Hard", xp: 75 },
  { id: "h3", title: "Study for 2 Hours", description: "Use goal videos, lessons, and stories for a focused long session", difficulty: "Hard", xp: 60 },
  { id: "h4", title: "Complete All Easy Tasks", description: "Finish every easy task for the day", difficulty: "Hard", xp: 50 },
  { id: "h5", title: "Score 80%+ in Any Quiz", description: "Reach at least 80% in any level-based quiz", difficulty: "Hard", xp: 55 },
];
