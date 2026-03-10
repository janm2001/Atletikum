import { Card, SimpleGrid, Text, Title } from "@mantine/core";
import type { PersonalBestSummary } from "@/hooks/useRecommendations";

interface DashboardPersonalBestsProps {
  summaries: PersonalBestSummary[] | undefined;
}

const DashboardPersonalBests = ({ summaries }: DashboardPersonalBestsProps) => {
  if (!summaries?.length) {
    return null;
  }

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Title order={4} mb="sm">
        Najnoviji osobni rekordi
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {summaries.map((summary) => (
          <Card
            key={`${summary.exerciseId}-${summary.metricType}`}
            withBorder
            p="sm"
          >
            <Text fw={600}>{summary.exerciseName}</Text>
            <Text size="sm" c="dimmed">
              {summary.label}: {summary.loadKg ? `${summary.loadKg} kg · ` : ""}
              {summary.bestValue} {summary.unitLabel}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Card>
  );
};

export default DashboardPersonalBests;
