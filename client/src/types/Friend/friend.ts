export type FriendshipStatus = "pending" | "accepted" | "blocked";

export interface FriendUser {
  _id: string;
  username: string;
  level: number;
  totalXp: number;
  dailyStreak: number;
  profilePicture: string;
}

export interface FriendEntry {
  friendshipId: string;
  friend: FriendUser;
  acceptedAt: string;
}

export interface FriendRequest {
  friendshipId: string;
  user: FriendUser;
  createdAt: string;
}

export interface PendingRequests {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

export interface FriendLeaderboardEntry extends FriendUser {
  rank: number;
  isMe: boolean;
  brainXp: number;
  bodyXp: number;
}
