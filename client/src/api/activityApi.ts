import { apiClient } from "@/utils/apiService";
import type { ActivityFeedResult, ActivityReaction, AllowedEmoji } from "@/types/Activity/activity";

const API_URL = "/activity";

interface FeedResponse {
  status: string;
  data: ActivityFeedResult;
}

interface ReactionsResponse {
  status: string;
  data: { reactions: ActivityReaction[] };
}

export async function getActivityFeed(page = 1): Promise<ActivityFeedResult> {
  const { data } = await apiClient.get<FeedResponse>(`${API_URL}/feed`, {
    params: { page },
  });
  return data.data;
}

export async function addReaction(eventId: string, emoji: AllowedEmoji): Promise<ActivityReaction[]> {
  const { data } = await apiClient.post<ReactionsResponse>(
    `${API_URL}/${eventId}/react`,
    { emoji },
  );
  return data.data.reactions;
}

export async function removeReaction(eventId: string): Promise<ActivityReaction[]> {
  const { data } = await apiClient.delete<ReactionsResponse>(
    `${API_URL}/${eventId}/react`,
  );
  return data.data.reactions;
}
