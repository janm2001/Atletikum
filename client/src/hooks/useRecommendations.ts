import { useQuery } from "@tanstack/react-query";
import { getWeeklyRecommendations } from "@/api/recommendations";
import { keys } from "@/lib/query-keys";

export type {
  NextSessionSuggestion,
  PersonalBestSummary,
  RecommendationInsight,
  RevisionRecommendation,
  WeeklyRecommendations,
} from "@/types/Recommendation/recommendation";

export const useWeeklyRecommendations = () => {
  return useQuery({
    queryKey: keys.recommendations.weekly(),
    queryFn: getWeeklyRecommendations,
  });
};