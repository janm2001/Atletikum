export type MovementLesson = {
  id: string;
  title: string;
  category: string;
  summary: string;
  minutes: number;
  illustration: "sit-to-stand" | null;
  introduction: string;
  steps: Array<{ title: string; cue: string; tip: string }>;
  question: string;
  options: string[];
};

export type LearningJourney = {
  lessons: MovementLesson[];
  completedLessonIds: string[];
  today: string;
  learnedToday: boolean;
  restingToday: boolean;
};

export type LessonResult = { correct: boolean; explanation: string; journey?: LearningJourney };
