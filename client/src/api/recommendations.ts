import type {
    WeeklyRecommendations,
    WeeklyRecommendationsResponse,
} from "@/types/Recommendation/recommendation";
import { apiClient } from "@/utils/apiService";

export async function getWeeklyRecommendations(): Promise<WeeklyRecommendations> {
    const { data } = await apiClient.get<WeeklyRecommendationsResponse>(
        "/recommendations/weekly",
    );
    return data.data;
}