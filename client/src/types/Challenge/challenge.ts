export interface WeeklyChallenge {
  _id: string;
  type: "quiz" | "workout" | "reading";
  targetCount: number;
  xpReward: number;
  description: string;
  weekEnd: string;
  currentCount: number;
  completed: boolean;
  xpAwarded: boolean;
}

export interface WeeklyChallengesResponse {
  status: string;
  data: {
    challenges: WeeklyChallenge[];
  };
}
