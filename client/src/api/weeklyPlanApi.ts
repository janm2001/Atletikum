import { apiClient } from "@/utils/apiService";
import type { WeeklyPlan, DailyProgress } from "@/types/WeeklyPlan";

type WeeklyPlanResponse = { status: string; data: WeeklyPlan };
type DailyProgressResponse = { status: string; data: DailyProgress };

export async function getWeeklyPlan(): Promise<WeeklyPlan> {
  const { data } = await apiClient.get<WeeklyPlanResponse>("/weekly-plan");
  return data.data;
}

export async function updateWeeklyPlanProgress(day: number): Promise<WeeklyPlan> {
  const { data } = await apiClient.patch<WeeklyPlanResponse>("/weekly-plan/progress", { day });
  return data.data;
}

export async function getDailyProgress(): Promise<DailyProgress> {
  const { data } = await apiClient.get<DailyProgressResponse>("/workout-logs/daily-progress");
  return data.data;
}
