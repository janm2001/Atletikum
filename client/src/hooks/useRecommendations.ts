import { useQuery } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { apiClient } from "@/utils/apiService";
import type { Workout } from "@/types/Workout/workout";
import type { ArticleSummary } from "@/types/Article/article";

type PersonalBestSummary = {
  exerciseId: string;
  exerciseName: string;
  metricType: "reps" | "distance" | "time";
  unitLabel: string;
  bestValue: number;
  loadKg: number | null;
  label: string;
  achievedAt?: string;
  workoutTitle?: string;
};

type NextSessionSuggestion = {
  exerciseId: string;
  exerciseName: string;
  metricType: "reps" | "distance" | "time";
  unitLabel: string;
  suggestedValue: number | null;
  suggestedLoadKg: number | null;
  reason: string;
};

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
    personalBestSummaries: PersonalBestSummary[];
    nextSessionSuggestions: NextSessionSuggestion[];
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