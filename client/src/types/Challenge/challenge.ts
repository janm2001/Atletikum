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

export interface ChallengeHistoryEntry {
  challengeId: string;
  type: "quiz" | "workout" | "reading";
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  xpReward: number;
}

export interface ChallengeHistoryWeek {
  weekStart: string;
  weekEnd: string;
  completionRate: number;
  challengesCompleted: number;
  totalChallenges: number;
  xpFromChallenges: number;
  allCompleted: boolean;
  entries: ChallengeHistoryEntry[];
}

export interface ChallengeHistoryData {
  items: ChallengeHistoryWeek[];
  pageInfo: {
    hasNextPage: boolean;
    nextCursorWeekStart: string | null;
  };
}

export interface ChallengeHistoryResponse {
  status: string;
  data: ChallengeHistoryData;
}

export interface WeeklyLeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  profilePicture: string | null;
  completedChallenges: number;
  xpFromChallenges: number;
  totalXp: number;
  dailyStreak: number;
}

export interface WeeklyLeaderboardData {
  week: {
    weekStart: string;
    weekEnd: string;
  };
  ranking: WeeklyLeaderboardUser[];
  currentUser: {
    rank: number;
    completedChallenges: number;
    xpFromChallenges: number;
    gapToNextRank: number;
  } | null;
}

export interface WeeklyLeaderboardResponse {
  status: string;
  data: WeeklyLeaderboardData;
}
