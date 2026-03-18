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
  claimed: boolean;
}

export interface WeeklyChallengesResponse {
  status: string;
  data: {
    challenges: WeeklyChallenge[];
  };
}

export interface ClaimRewardData {
  claim: {
    challengeId: string;
    type: "quiz" | "workout" | "reading";
    claimedAt: string;
    xpAwarded: number;
    alreadyClaimed: boolean;
  };
  progress: {
    userId: string;
    brainXp: number;
    bodyXp: number;
    totalXp: number;
    level: number;
    leveledUp: boolean;
    levelFrom: number | null;
    levelTo: number | null;
  };
  celebration: {
    showCelebration: boolean;
    reasons: Array<"challenge_complete" | "level_up" | "all_weekly_challenges_complete">;
  };
  allChallengesCompleted: {
    completed: boolean;
    bonusAwarded: boolean;
    bonusXp: number;
  };
}

export interface ClaimRewardResponse {
  status: string;
  data: ClaimRewardData;
}
