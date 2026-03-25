import { useMemo } from "react";
import { Container, Grid, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../../hooks/useUser";
import { useArticles } from "../../hooks/useArticle";
import { useWorkouts } from "../../hooks/useWorkout";
import { getLevelFromTotalXp } from "../../utils/leveling";
import { useWeeklyRecommendations } from "@/hooks/useRecommendations";
import { useWeeklyChallenges } from "@/hooks/useChallenges";
import QueryErrorMessage from "@/components/Common/QueryErrorMessage";
import DashboardStatsGrid from "@/components/Dashboard/DashboardStatsGrid";
import DashboardQuestsCard from "@/components/Dashboard/DashboardQuestsCard";
import DashboardTrainingRecommendation from "@/components/Dashboard/DashboardTrainingRecommendation";
import DashboardLeaderboardPeek from "@/components/Dashboard/DashboardLeaderboardPeek";
import DashboardRecommendedContent from "@/components/Dashboard/DashboardRecommendedContent";
import { DashboardDailyProgress } from "@/components/Dashboard/DashboardDailyProgress/DashboardDailyProgress";
import { DashboardWeeklyPlan } from "@/components/Dashboard/DashboardWeeklyPlan/DashboardWeeklyPlan";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: articles, error: articlesError } = useArticles();
  const { data: workouts, error: workoutsError } = useWorkouts();
  const { data: recommendations } = useWeeklyRecommendations();
  const { data: weeklyChallenges } = useWeeklyChallenges();

  const level = user ? getLevelFromTotalXp(user.totalXp) : 1;

  const suggestedWorkout = useMemo(() => {
    if (recommendations?.workouts?.[0]) {
      return recommendations.workouts[0];
    }

    if (!workouts || !user) return null;
    const available = workouts
      .filter((w) => w.requiredLevel <= level)
      .sort((a, b) => b.requiredLevel - a.requiredLevel);
    return available[0] ?? workouts[0] ?? null;
  }, [recommendations?.workouts, workouts, user, level]);

  const topArticles = useMemo(() => {
    if (recommendations?.articles?.length) {
      return recommendations.articles;
    }

    return (articles ?? []).slice(0, 3);
  }, [articles, recommendations]);

  return (
    <Container size="xl" py={{ base: "sm", md: "md" }}>
      <Stack gap="md">
        <DashboardStatsGrid
          level={level}
          totalXp={user?.totalXp ?? 0}
          dailyStreak={user?.dailyStreak ?? 0}
        />

        {articlesError && (
          <QueryErrorMessage message={t("dashboard.errors.articles")} />
        )}

        {workoutsError && (
          <QueryErrorMessage message={t("dashboard.errors.workouts")} />
        )}

        <Grid gutter="md" align="stretch">
          <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
            <Stack gap="md">
              <DashboardQuestsCard
                insight={recommendations?.insight}
                weeklyChallenges={weeklyChallenges}
              />
              <DashboardWeeklyPlan />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
            <DashboardTrainingRecommendation
              workout={suggestedWorkout}
              onStart={(id) => navigate(`/zapis-treninga/trening/${id}`)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 12, xl: 4 }}>
            <Stack gap="md">
              <DashboardDailyProgress />
              <DashboardLeaderboardPeek />
              <DashboardRecommendedContent
                articles={topArticles}
                onNavigate={(id) => navigate(`/edukacija/${id}`)}
              />
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default Dashboard;
