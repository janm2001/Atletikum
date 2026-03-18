import { SimpleGrid } from "@mantine/core";
import type { RecommendationInsight } from "@/hooks/useRecommendations";
import type { WeeklyChallenge } from "@/types/Challenge/challenge";
import type { ArticleSummary } from "@/types/Article/article";
import DashboardWeeklyGoalCard from "./DashboardWeeklyGoalCard";
import DashboardWeeklyChallengesCard from "./DashboardWeeklyChallengesCard";
import DashboardContinueLearningCard from "./DashboardContinueLearningCard";

interface DashboardEngagementGridProps {
  insight: RecommendationInsight | undefined;
  weeklyChallenges: WeeklyChallenge[] | undefined;
  resumeArticle: ArticleSummary | null;
  onContinue: (articleId: string) => void;
}

const DashboardEngagementGrid = ({
  insight,
  weeklyChallenges,
  resumeArticle,
  onContinue,
}: DashboardEngagementGridProps) => {
  const hasGoal = !!insight;
  const hasChallenges = !!(weeklyChallenges && weeklyChallenges.length > 0);
  const hasContinue = !!resumeArticle;

  const count = [hasGoal, hasChallenges, hasContinue].filter(Boolean).length;

  if (count === 0) return null;

  const cols =
    count === 1
      ? { base: 1 as const }
      : count === 2
        ? { base: 1 as const, sm: 2 as const }
        : { base: 1 as const, sm: 2 as const, lg: 3 as const };

  return (
    <SimpleGrid cols={cols} spacing="md">
      {hasGoal && <DashboardWeeklyGoalCard insight={insight!} />}
      {hasChallenges && (
        <DashboardWeeklyChallengesCard challenges={weeklyChallenges!} />
      )}
      {hasContinue && (
        <DashboardContinueLearningCard
          article={resumeArticle}
          onContinue={onContinue}
        />
      )}
    </SimpleGrid>
  );
};

export default DashboardEngagementGrid;
