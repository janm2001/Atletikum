import { useMemo } from "react";
import { Container, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import Exercises from "../../components/Dashboard/Exercises/Exercises";
import { XpProgressSection } from "../../components/XpProgress/XpProgressSection";
import { useUser } from "../../hooks/useUser";
import { useArticles, useToggleArticleBookmark } from "../../hooks/useArticle";
import { useWorkouts } from "../../hooks/useWorkout";
import { useMyQuizCompletions } from "../../hooks/useQuiz";
import { getLevelFromTotalXp } from "../../utils/leveling";
import { useWeeklyRecommendations } from "@/hooks/useRecommendations";
import type { ArticleSummary } from "@/types/Article/article";
import DashboardArticlesSection from "@/components/Dashboard/DashboardArticlesSection";
import DashboardPersonalBests from "@/components/Dashboard/DashboardPersonalBests";
import DashboardRevisionCard from "@/components/Dashboard/DashboardRevisionCard";
import DashboardStatsGrid from "@/components/Dashboard/DashboardStatsGrid";
import DashboardWelcomeText from "@/components/Dashboard/DashboardWelcomeText";
import DashboardWorkoutSection from "@/components/Dashboard/DashboardWorkoutSection";
import DashboardWeeklyGoalCard from "@/components/Dashboard/DashboardWeeklyGoalCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: workouts } = useWorkouts();
  const { data: completedArticleIds } = useMyQuizCompletions();
  const toggleBookmarkMutation = useToggleArticleBookmark();
  const { data: recommendations, isLoading: recommendationsLoading } =
    useWeeklyRecommendations();

  const completedSet = useMemo(
    () => new Set(completedArticleIds ?? []),
    [completedArticleIds],
  );

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

  const handleToggleBookmark = (article: ArticleSummary) => {
    toggleBookmarkMutation.mutate({
      articleId: article._id,
      shouldBookmark: !article.bookmark?.isBookmarked,
    });
  };

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        <DashboardWelcomeText />

        <DashboardStatsGrid
          level={level}
          totalXp={user?.totalXp ?? 0}
          dailyStreak={user?.dailyStreak ?? 0}
        />

        <DashboardWeeklyGoalCard insight={recommendations?.insight} />

        <XpProgressSection variant="full" />

        <DashboardRevisionCard
          revision={recommendations?.revision}
          onStartRevision={(articleId) =>
            navigate(`/edukacija/${articleId}/kviz`)
          }
        />

        <DashboardPersonalBests
          summaries={recommendations?.personalBestSummaries}
        />

        <DashboardArticlesSection
          articles={topArticles}
          isLoading={articlesLoading || recommendationsLoading}
          completedArticleIds={completedSet}
          onNavigateArticle={(id) => navigate(`/edukacija/${id}`)}
          onOpenArticles={() => navigate("/edukacija")}
          onToggleBookmark={handleToggleBookmark}
        />

        <DashboardWorkoutSection
          workout={suggestedWorkout}
          onOpenWorkouts={() => navigate("/zapis-treninga")}
        />

        <Exercises />
      </Stack>
    </Container>
  );
};

export default Dashboard;
