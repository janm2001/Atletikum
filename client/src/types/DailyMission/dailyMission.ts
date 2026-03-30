export type MissionType =
  | "log_workout"
  | "complete_quiz"
  | "read_article"
  | "check_leaderboard";

export interface Mission {
  _id: string;
  type: MissionType;
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
}

export interface DailyMissionDoc {
  _id: string;
  user: string;
  date: string;
  missions: Mission[];
  bonusClaimed: boolean;
  createdAt: string;
}
