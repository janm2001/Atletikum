import { Button, Card, Group, Text, Title } from "@mantine/core";
import type { RevisionRecommendation } from "@/hooks/useRecommendations";

interface DashboardRevisionCardProps {
  revision: RevisionRecommendation | null | undefined;
  onStartRevision: (articleId: string) => void;
}

const DashboardRevisionCard = ({
  revision,
  onStartRevision,
}: DashboardRevisionCardProps) => {
  if (!revision) {
    return null;
  }

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Group justify="space-between" align="center" wrap="wrap">
        <div>
          <Title order={4}>Vrijeme za ponavljanje</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Zadnji rezultat: {revision.lastScore}/{revision.totalQuestions}.
            Ponovi gradivo i osvoji novi XP.
          </Text>
        </div>
        <Button onClick={() => onStartRevision(revision.articleId)}>
          Pokreni revision kviz
        </Button>
      </Group>
    </Card>
  );
};

export default DashboardRevisionCard;
