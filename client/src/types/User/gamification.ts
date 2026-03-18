export interface GamificationStatus {
  dailyStreak: number;
  longestStreak: number;
  streakExpiresAt: string | null;
  streakAtRisk: boolean;
  hasActivityToday: boolean;
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  xpForNextLevel: number;
  currentLevelProgress: number;
  fastestXpAction: "quiz" | "workout";
}

export interface GamificationStatusResponse {
  status: string;
  data: GamificationStatus;
}
