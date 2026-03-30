import { apiClient } from "@/utils/apiService";
import type {
  FriendEntry,
  FriendLeaderboardEntry,
  PendingRequests,
} from "@/types/Friend/friend";

const API_URL = "/friends";

interface FriendsResponse {
  status: string;
  data: { friends: FriendEntry[] };
}

interface RequestsResponse {
  status: string;
  data: { requests: PendingRequests };
}

interface LeaderboardResponse {
  status: string;
  data: { leaderboard: FriendLeaderboardEntry[] };
}

export async function getMyFriends(): Promise<FriendEntry[]> {
  const { data } = await apiClient.get<FriendsResponse>(API_URL);
  return data.data.friends;
}

export async function getPendingRequests(): Promise<PendingRequests> {
  const { data } = await apiClient.get<RequestsResponse>(`${API_URL}/requests`);
  return data.data.requests;
}

export async function sendFriendRequest(username: string): Promise<void> {
  await apiClient.post(API_URL, { username });
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  await apiClient.post(`${API_URL}/accept/${friendshipId}`);
}

export async function removeFriend(friendshipId: string): Promise<void> {
  await apiClient.delete(`${API_URL}/${friendshipId}`);
}

export async function blockUser(userId: string): Promise<void> {
  await apiClient.post(`${API_URL}/block/${userId}`);
}

export async function getFriendLeaderboard(): Promise<FriendLeaderboardEntry[]> {
  const { data } = await apiClient.get<LeaderboardResponse>(`${API_URL}/leaderboard`);
  return data.data.leaderboard;
}
