import { useQuery } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { apiClient } from "@/utils/apiService";
import type { Workout } from "@/types/Workout/workout";
import type { ArticleSummary } from "@/types/Article/article";

type RevisionRecommendation = {
  articleId: string;
  lastScore: number;
  totalQuestions: number;
  completedAt: string;
};

type RecommendationInsight = {
  focusReason: string;
  lowReadiness: boolean;
  readinessScore: number;
  feedbackScore: number;
  completedThisWeek: number;
  weeklyTarget: number;
};

type WeeklyRecommendationsResponse = {
  status: string;
  data: {
    workouts: Workout[];
    articles: ArticleSummary[];
    revision: RevisionRecommendation | null;
    insight: RecommendationInsight;
  };
};

export const useWeeklyRecommendations = () => {
  return useQuery({
    queryKey: keys.recommendations.weekly(),
    queryFn: async () => {
      const { data } = await apiClient.get<WeeklyRecommendationsResponse>(
        "/recommendations/weekly",
      );
      return data.data;
    },
  });
};