import { getYouTubeSearchUrl } from "@/lib/youtube";

export const storyVideoMap: Record<string, string> = {
  "1": "https://www.youtube.com/watch?v=arC7y8N26D4",
  "2": "https://www.youtube.com/watch?v=Dxcc6ycZ73M",
  "3": "https://www.youtube.com/watch?v=pyM7VJGSsW8",
  "4": "https://www.youtube.com/watch?v=H6mRkx1x77k",
  "5": "https://www.youtube.com/watch?v=4M8z-I2k7K4",
  "6": "https://www.youtube.com/watch?v=YQHsXMglC9A",
  "7": "https://www.youtube.com/watch?v=l7-f9gS5T3M",
  "8": "https://www.youtube.com/watch?v=1i9kcBHX2Nw",
  "9": "https://www.youtube.com/watch?v=Un2yBgIAxYs",
  "10": "https://www.youtube.com/watch?v=Hz4FNBj1APA",
  "11": "https://www.youtube.com/watch?v=arj7oStGLkU",
  "12": "https://www.youtube.com/watch?v=0Y0R7v9YfJ4",
  "13": "https://www.youtube.com/watch?v=e-P5IFTqB98",
  "14": "https://www.youtube.com/watch?v=2ePf9rue1Ao",
  "15": "https://www.youtube.com/watch?v=VQv0M7Pr0g8",
  "16": "https://www.youtube.com/watch?v=vd2dtkMINIw",
  "17": "https://www.youtube.com/watch?v=zEPdVk-6D4Q",
  "18": "https://www.youtube.com/watch?v=JhHMJCUmq28",
};

export const skillOverviewVideoMap: Record<string, string> = {
  coding: "https://www.youtube.com/watch?v=zOjov-2OZ0E",
  "critical-thinking": "https://www.youtube.com/watch?v=dItUGF8GdTw",
  communication: "https://www.youtube.com/watch?v=HAnw168huqA",
  "time-management": "https://www.youtube.com/watch?v=iONDebHX9qk",
  creativity: "https://www.youtube.com/watch?v=Uj1ykZWtPYI",
  "digital-literacy": "https://www.youtube.com/watch?v=hG6P_n3XnGg",
  "problem-solving": "https://www.youtube.com/watch?v=6yr8Fq47PUQ",
  "emotional-intelligence": "https://www.youtube.com/watch?v=LgUCyWhJf6s",
  "study-skills": "https://www.youtube.com/watch?v=IlU-zDU6aQ0",
  collaboration: "https://www.youtube.com/watch?v=8P_wEz4md84",
  observation: "https://www.youtube.com/watch?v=QmX3QYf6wUQ",
  environmental: "https://www.youtube.com/watch?v=aGGBGcjdjXA",
};

export type VideoResource = {
  label: string;
  url: string;
};

export const getStoryVideoUrl = (storyId: string, storyTitle: string) => {
  return storyVideoMap[storyId] ?? getYouTubeSearchUrl(`${storyTitle} explained for students`);
};

export const getSkillLessonVideoRecommendations = (skillTitle: string, lessonTitle: string): VideoResource[] => {
  const base = `${skillTitle} ${lessonTitle}`;

  return [
    { label: "Explanation", url: getYouTubeSearchUrl(`${base} explained for students`) },
    { label: "Examples", url: getYouTubeSearchUrl(`${base} examples tutorial`) },
    { label: "Practice", url: getYouTubeSearchUrl(`${base} practice questions`) },
  ];
};