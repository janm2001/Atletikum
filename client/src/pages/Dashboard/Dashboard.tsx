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
import DashboardContinueLearningCard from "@/components/Dashboard/DashboardContinueLearningCard";
import DashboardAlmostLevelUpCard from "@/components/Dashboard/DashboardAlmostLevelUpCard";
import { useGamificationStatus } from "@/hooks/useGamification";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: workouts } = useWorkouts();
  const { data: completedArticleIds } = useMyQuizCompletions();
  const toggleBookmarkMutation = useToggleArticleBookmark();
  const { data: recommendations, isLoading: recommendationsLoading } =
    useWeeklyRecommendations();
  const { data: gamification } = useGamificationStatus();

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

  const resumeArticle = useMemo(() => {
    if (!articles?.length) {
      return null;
    }

    const inProgress = articles.filter((article) => {
      const progress = Number(article.bookmark?.progressPercent ?? 0);
      return progress > 0 && progress < 100;
    });

    if (inProgress.length === 0) {
      return null;
    }

    const sortedCandidates = [...inProgress].sort((left, right) => {
      const leftLastViewed = left.bookmark?.lastViewedAt
        ? new Date(left.bookmark.lastViewedAt).getTime()
        : 0;
      const rightLastViewed = right.bookmark?.lastViewedAt
        ? new Date(right.bookmark.lastViewedAt).getTime()
        : 0;

      if (rightLastViewed !== leftLastViewed) {
        return rightLastViewed - leftLastViewed;
      }

      const leftProgress = Number(left.bookmark?.progressPercent ?? 0);
      const rightProgress = Number(right.bookmark?.progressPercent ?? 0);
      return rightProgress - leftProgress;
    });

    return sortedCandidates[0] ?? null;
  }, [articles]);

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

        <XpProgressSection variant="full" />

        {gamification && (
          <DashboardAlmostLevelUpCard
            gamification={gamification}
            onDoQuiz={() => navigate("/edukacija")}
            onDoWorkout={() => navigate("/zapis-treninga")}
          />
        )}

        <DashboardWeeklyGoalCard insight={recommendations?.insight} />

        <DashboardContinueLearningCard
          article={resumeArticle}
          onContinue={(articleId) => navigate(`/edukacija/${articleId}`)}
        />

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
