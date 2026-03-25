export interface SuggestedWorkout {
  day: number;
  workoutId: string;
  reason: string;
}

export interface WeeklyPlan {
  _id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  targetSessions: number;
  completedDays: number[];
  suggestedWorkouts: SuggestedWorkout[];
  completedCount: number;
  remainingSessions: number;
  completionPercentage: number;
  todayIsoDay: number;
  todayCompleted: boolean;
}

export interface DailyProgress {
  completed: number;
  limit: number;
  remaining: number;
  canTrain: boolean;
}

export interface SpacedRepetitionInfo {
  cooldownLevel: number;
  cooldownDays: number;
  attemptNumber: number;
  xpMultiplier: number;
}
