import { Button, Card, Group, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { RevisionRecommendation } from "@/hooks/useRecommendations";

interface DashboardRevisionCardProps {
  revision: RevisionRecommendation | null | undefined;
  onStartRevision: (articleId: string) => void;
}

const DashboardRevisionCard = ({
  revision,
  onStartRevision,
}: DashboardRevisionCardProps) => {
  const { t } = useTranslation();
  if (!revision) {
    return null;
  }

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Group justify="space-between" align="center" wrap="wrap">
        <div>
          <Title order={4}>{t('dashboard.revision.title')}</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {t('dashboard.revision.description', { score: revision.lastScore, total: revision.totalQuestions })}
          </Text>
        </div>
        <Button onClick={() => onStartRevision(revision.articleId)}>
          {t('dashboard.revision.startQuiz')}
        </Button>
      </Group>
    </Card>
  );
};

export default DashboardRevisionCard;
