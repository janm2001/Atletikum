import type {
  GamificationStatus,
  GamificationStatusResponse,
} from "@/types/User/gamification";
import { apiClient } from "@/utils/apiService";

export async function getGamificationStatus(): Promise<GamificationStatus> {
  const { data } = await apiClient.get<GamificationStatusResponse>(
    "/users/gamification-status",
  );
  return data.data;
}
