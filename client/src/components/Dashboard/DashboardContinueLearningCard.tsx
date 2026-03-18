import { Button, Card, Group, Progress, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ArticleSummary } from "@/types/Article/article";

interface DashboardContinueLearningCardProps {
  article: ArticleSummary | null;
  onContinue: (articleId: string) => void;
}

const DashboardContinueLearningCard = ({
  article,
  onContinue,
}: DashboardContinueLearningCardProps) => {
  const { t } = useTranslation();

  if (!article) {
    return null;
  }

  const progress = Math.max(
    0,
    Math.min(100, Number(article.bookmark?.progressPercent ?? 0)),
  );
  const lastViewedAt = article.bookmark?.lastViewedAt;

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Group justify="space-between" align="flex-start" mb="xs" gap="md" wrap="wrap">
        <div>
          <Title order={4}>{t("dashboard.continueLearning.title")}</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {t("dashboard.continueLearning.description")}
          </Text>
        </div>
        <Button variant="light" onClick={() => onContinue(article._id)}>
          {t("dashboard.continueLearning.action")}
        </Button>
      </Group>

      <Text fw={600} mb={6} lineClamp={2}>
        {article.title}
      </Text>

      <Progress value={progress} radius="xl" size="md" mb={6} color="blue" />

      <Group justify="space-between" gap="xs">
        <Text size="sm" fw={500}>
          {t("dashboard.continueLearning.progress", { progress })}
        </Text>
        {lastViewedAt ? (
          <Text size="xs" c="dimmed">
            {t("dashboard.continueLearning.lastRead", {
              date: new Date(lastViewedAt).toLocaleDateString("hr-HR"),
            })}
          </Text>
        ) : null}
      </Group>
    </Card>
  );
};

export default DashboardContinueLearningCard;
