import { Badge, Card, Group, Progress, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { RecommendationInsight } from "@/hooks/useRecommendations";

interface DashboardWeeklyGoalCardProps {
  insight: RecommendationInsight | undefined;
}

const DashboardWeeklyGoalCard = ({ insight }: DashboardWeeklyGoalCardProps) => {
  const { t } = useTranslation();

  if (!insight) {
    return null;
  }

  const completed = Math.max(0, insight.completedThisWeek ?? 0);
  const weeklyTarget = Math.max(0, insight.weeklyTarget ?? 0);
  const targetForProgress = weeklyTarget > 0 ? weeklyTarget : 1;
  const progress = Math.min(100, Math.round((completed / targetForProgress) * 100));
  const remaining = Math.max(weeklyTarget - completed, 0);
  const isGoalReached = weeklyTarget > 0 && completed >= weeklyTarget;

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Group justify="space-between" align="flex-start" mb="xs" gap="sm">
        <div>
          <Title order={4}>{t("dashboard.weeklyGoal.title")}</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {t("dashboard.weeklyGoal.description", {
              completed,
              target: weeklyTarget,
            })}
          </Text>
        </div>
        {insight.lowReadiness && (
          <Badge color="orange" variant="light">
            {t("dashboard.weeklyGoal.lowReadiness")}
          </Badge>
        )}
      </Group>

      <Progress value={progress} radius="xl" size="md" mb="xs" color="violet" />

      <Text size="sm" fw={600}>
        {isGoalReached
          ? t("dashboard.weeklyGoal.goalReached")
          : t("dashboard.weeklyGoal.remaining", { count: remaining })}
      </Text>

      <Text size="xs" c="dimmed" mt={6} lineClamp={2}>
        {t("dashboard.weeklyGoal.focusReason")}: {insight.focusReason}
      </Text>
    </Card>
  );
};

export default DashboardWeeklyGoalCard;
