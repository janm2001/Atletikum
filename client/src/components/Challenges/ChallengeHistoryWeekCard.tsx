import { Badge, Card, Group, Progress, Stack, Text } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { ChallengeHistoryWeek } from "@/types/Challenge/challenge";
import ChallengeHistoryEntryRow from "./ChallengeHistoryEntryRow";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

interface ChallengeHistoryWeekCardProps {
  week: ChallengeHistoryWeek;
}

const ChallengeHistoryWeekCard = ({ week }: ChallengeHistoryWeekCardProps) => {
  const { t } = useTranslation();
  const rateColor =
    week.completionRate >= 1
      ? "green"
      : week.completionRate >= 0.5
        ? "yellow"
        : "red";

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" align="flex-start" mb="sm">
        <div>
          <Text fw={600} size="sm">
            {t("challenges.history.weekRange", {
              from: formatDate(week.weekStart),
              to: formatDate(week.weekEnd),
            })}
          </Text>
          <Text size="xs" c="dimmed">
            {t("challenges.history.xpEarned", { xp: week.xpFromChallenges })}
          </Text>
        </div>
        <Group gap="xs">
          {week.allCompleted && (
            <Badge
              color="green"
              variant="light"
              size="sm"
              leftSection={<IconTrophy size={10} />}
            >
              {t("challenges.history.allCompleted")}
            </Badge>
          )}
          <Badge size="sm" variant="light" color={rateColor}>
            {week.challengesCompleted}/{week.totalChallenges}
          </Badge>
        </Group>
      </Group>

      <Progress
        value={Math.round(week.completionRate * 100)}
        radius="xl"
        size="sm"
        color={rateColor}
        mb="sm"
      />

      <Stack gap="sm">
        {week.entries.map((entry) => (
          <ChallengeHistoryEntryRow key={entry.challengeId} entry={entry} />
        ))}
      </Stack>
    </Card>
  );
};

export default ChallengeHistoryWeekCard;
