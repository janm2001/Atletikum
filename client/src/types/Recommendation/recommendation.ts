import type { ArticleSummary } from "@/types/Article/article";
import type { Workout } from "@/types/Workout/workout";

export type PersonalBestSummary = {
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

export type NextSessionSuggestion = {
    exerciseId: string;
    exerciseName: string;
    metricType: "reps" | "distance" | "time";
    unitLabel: string;
    suggestedValue: number | null;
    suggestedLoadKg: number | null;
    reason: string;
};

export type RevisionRecommendation = {
    articleId: string;
    lastScore: number;
    totalQuestions: number;
    completedAt: string;
};

export type RecommendationInsight = {
    focusReason: string;
    lowReadiness: boolean;
    readinessScore: number;
    feedbackScore: number;
    completedThisWeek: number;
    weeklyTarget: number;
};

export type WeeklyRecommendationsPayload = {
    workouts: Workout[];
    articles: ArticleSummary[];
    revision: RevisionRecommendation | null;
    personalBestSummaries: PersonalBestSummary[];
    nextSessionSuggestions: NextSessionSuggestion[];
    insight: RecommendationInsight;
};

export type WeeklyRecommendationsResponse = {
    status: string;
    data: WeeklyRecommendationsPayload;
};

export type WeeklyRecommendations = WeeklyRecommendationsResponse["data"];