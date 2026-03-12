import type { NewAchievement } from "@/types/Achievement/achievement";
import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";

export type CelebrationPersonalBest = CompletedExercisePayload & {
  exerciseName?: string;
};

export interface CelebrationState {
  type: "quiz" | "workout";
  xpGained: number;
  title?: string;
  score?: number;
  totalQuestions?: number;
  newAchievements?: NewAchievement[];
  level?: number;
  totalXp?: number;
  brainXp?: number;
  bodyXp?: number;
  personalBests?: CelebrationPersonalBest[];
}
