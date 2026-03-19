import { Badge, Group, Progress, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { ChallengeHistoryEntry } from "@/types/Challenge/challenge";

const CHALLENGE_TYPE_KEYS: Record<ChallengeHistoryEntry["type"], string> = {
  quiz: "dashboard.weeklyChallenges.typeQuiz",
  workout: "dashboard.weeklyChallenges.typeWorkout",
  reading: "dashboard.weeklyChallenges.typeReading",
};

interface ChallengeHistoryEntryRowProps {
  entry: ChallengeHistoryEntry;
}

const ChallengeHistoryEntryRow = ({ entry }: ChallengeHistoryEntryRowProps) => {
  const { t } = useTranslation();
  const progress = Math.min(
    100,
    Math.round((entry.currentCount / entry.targetCount) * 100),
  );

  return (
    <Stack gap={4}>
      <Group justify="space-between">
        <Group gap="xs">
          <ThemeIcon
            size="xs"
            radius="sm"
            color={entry.completed ? "green" : "gray"}
            variant="light"
          >
            <IconCheck size={10} />
          </ThemeIcon>
          <Text size="sm">{t(CHALLENGE_TYPE_KEYS[entry.type])}</Text>
        </Group>
        <Badge
          size="xs"
          variant="light"
          color={entry.claimed ? "green" : entry.completed ? "yellow" : "gray"}
        >
          {entry.claimed
            ? t("challenges.history.xpClaimed", { xp: entry.xpReward })
            : t("common.xpGained", { count: entry.xpReward })}
        </Badge>
      </Group>
      <Progress
        value={progress}
        size="xs"
        color={entry.completed ? "green" : "gray"}
        radius="xl"
      />
      <Text size="xs" c="dimmed">
        {entry.currentCount} / {entry.targetCount}
      </Text>
    </Stack>
  );
};

export default ChallengeHistoryEntryRow;
