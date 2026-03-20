import { useMemo } from "react";
import { SimpleGrid } from "@mantine/core";
import type { RecommendationInsight } from "@/hooks/useRecommendations";
import type { WeeklyChallenge } from "@/types/Challenge/challenge";
import type { ArticleSummary } from "@/types/Article/article";
import { useAchievements } from "@/hooks/useAchievements";
import DashboardWeeklyGoalCard from "./DashboardWeeklyGoalCard";
import DashboardWeeklyChallengesCard from "./DashboardWeeklyChallengesCard";
import DashboardContinueLearningCard from "./DashboardContinueLearningCard";
import DashboardAlmostUnlockedCard from "./DashboardAlmostUnlockedCard";

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
  const { data: achievements } = useAchievements();

  const almostUnlocked = useMemo(() => {
    if (!achievements) return [];
    return achievements
      .filter(
        (a) => !a.isUnlocked && a.progress && a.progress.progressPercent >= 75,
      )
      .sort(
        (a, b) =>
          (b.progress?.progressPercent ?? 0) -
          (a.progress?.progressPercent ?? 0),
      )
      .slice(0, 3);
  }, [achievements]);

  const hasGoal = !!insight;
  const hasChallenges = !!(weeklyChallenges && weeklyChallenges.length > 0);
  const hasContinue = !!resumeArticle;
  const hasAlmostUnlocked = almostUnlocked.length > 0;

  const count = [hasGoal, hasChallenges, hasContinue, hasAlmostUnlocked].filter(
    Boolean,
  ).length;

  if (count === 0) return null;

  const cols =
    count === 1
      ? { base: 1 as const }
      : { base: 1 as const, sm: 2 as const };

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
      {hasAlmostUnlocked && (
        <DashboardAlmostUnlockedCard achievements={almostUnlocked} />
      )}
    </SimpleGrid>
  );
};

export default DashboardEngagementGrid;
