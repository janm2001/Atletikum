import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBarbell,
  IconBook,
  IconBrain,
  IconCheck,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { WeeklyChallenge } from "@/types/Challenge/challenge";
import { useClaimChallengeReward } from "@/hooks/useChallenges";
import classes from "./DashboardChallengeRow.module.css";

const CHALLENGE_CONFIG = {
  quiz: { icon: IconBrain, color: "blue" },
  workout: { icon: IconBarbell, color: "violet" },
  reading: { icon: IconBook, color: "teal" },
} as const;

const ChallengeCategoryLabel: Record<WeeklyChallenge["type"], string> = {
  quiz: "dashboard.weeklyChallenges.typeQuiz",
  workout: "dashboard.weeklyChallenges.typeWorkout",
  reading: "dashboard.weeklyChallenges.typeReading",
};

export const ChallengeRow = ({
  challenge,
}: {
  challenge: WeeklyChallenge;
}) => {
  const { t } = useTranslation();
  const claimMutation = useClaimChallengeReward();
  const config = CHALLENGE_CONFIG[challenge.type];
  const Icon = config.icon;
  const progress = Math.min(
    100,
    Math.round((challenge.currentCount / challenge.targetCount) * 100),
  );

  const handleClaim = async () => {
    try {
      const result = await claimMutation.mutateAsync(challenge._id);
      notifications.show({
        color: "green",
        message: t("challenges.claim.success", { xp: result.claim.xpAwarded }),
      });
    } catch {
      notifications.show({
        color: "red",
        message: t("challenges.claim.error"),
      });
    }
  };

  return (
    <Card withBorder radius="md" p="sm" className={classes.card}>
      <Stack gap={6}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              size={44}
              radius="xl"
              color={challenge.completed ? "green" : config.color}
              variant="light"
              className={classes.shrink0}
            >
              {challenge.completed ? (
                <IconCheck size={22} />
              ) : (
                <Icon size={22} />
              )}
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={600} size="md">
                {t(ChallengeCategoryLabel[challenge.type])}
              </Text>
              <Text size="sm" c="var(--app-text-muted)">
                {challenge.completed
                  ? t("dashboard.weeklyChallenges.completed")
                  : t("dashboard.weeklyChallenges.progress", {
                      current: challenge.currentCount,
                      total: challenge.targetCount,
                    })}
              </Text>
            </Stack>
          </Group>
          <Badge
            size="sm"
            variant="filled"
            color={challenge.xpAwarded ? "green" : "yellow"}
            className={classes.shrink0}
          >
            {challenge.xpAwarded
              ? t("dashboard.weeklyChallenges.rewardClaimed")
              : `+${challenge.xpReward} XP`}
          </Badge>
        </Group>

        <Progress
          value={progress}
          color={challenge.completed ? "green" : config.color}
          radius="xl"
          size="md"
          ml={56}
        />

        {challenge.completed && !challenge.claimed && (
          <Button
            size="xs"
            variant="light"
            color="green"
            loading={claimMutation.isPending}
            onClick={handleClaim}
            fullWidth
            mt={2}
          >
            {t("challenges.claim.button")}
          </Button>
        )}
      </Stack>
    </Card>
  );
};
