import { apiClient } from "@/utils/apiService";
import type { DailyMissionDoc } from "@/types/DailyMission/dailyMission";

const API_URL = "/daily-missions";

interface MissionResponse {
  status: string;
  data: { missions: DailyMissionDoc };
}

export async function getTodaysMissions(): Promise<DailyMissionDoc> {
  const { data } = await apiClient.get<MissionResponse>(`${API_URL}/today`);
  return data.data.missions;
}

export async function trackLeaderboardVisit(): Promise<DailyMissionDoc | null> {
  const { data } = await apiClient.post<MissionResponse>(
    `${API_URL}/track/leaderboard`,
  );
  return data.data.missions;
}

export async function trackArticleRead(): Promise<DailyMissionDoc | null> {
  const { data } = await apiClient.post<MissionResponse>(
    `${API_URL}/track/article`,
  );
  return data.data.missions;
}
