export type ActivityEventType =
  | "level_up"
  | "achievement_unlocked"
  | "personal_best"
  | "workout_completed"
  | "streak_milestone"
  | "quiz_aced";

export const ALLOWED_EMOJIS = ["💪", "🔥", "🏆", "👏", "🎉"] as const;
export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];

export interface ActivityReaction {
  userId: string;
  emoji: AllowedEmoji;
}

export interface ActivityEventUser {
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
}

export interface ActivityEvent {
  _id: string;
  user: ActivityEventUser;
  type: ActivityEventType;
  data: Record<string, unknown>;
  reactions: ActivityReaction[];
  createdAt: string;
}

export interface ActivityFeedResult {
  events: ActivityEvent[];
  total: number;
  page: number;
  hasMore: boolean;
}
