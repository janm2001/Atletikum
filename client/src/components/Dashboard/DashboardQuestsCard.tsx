import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBarbell,
  IconBook,
  IconBrain,
  IconCheck,
  IconTarget,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { RecommendationInsight } from "@/hooks/useRecommendations";
import type { WeeklyChallenge } from "@/types/Challenge/challenge";
import { useClaimChallengeReward } from "@/hooks/useChallenges";

interface DashboardQuestsCardProps {
  insight: RecommendationInsight | undefined;
  weeklyChallenges: WeeklyChallenge[] | undefined;
}

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

const ChallengeRow = ({ challenge }: { challenge: WeeklyChallenge }) => {
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
    <Stack gap={6}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon
            size={44}
            radius="xl"
            color={challenge.completed ? "green" : config.color}
            variant="light"
            style={{ flexShrink: 0 }}
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
            <Text size="sm" c="dimmed">
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
          style={{ flexShrink: 0 }}
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
  );
};

const DashboardQuestsCard = ({
  insight,
  weeklyChallenges,
}: DashboardQuestsCardProps) => {
  const { t } = useTranslation();

  const hasGoal = !!insight;
  const hasChallenges = !!(weeklyChallenges && weeklyChallenges.length > 0);

  if (!hasGoal && !hasChallenges) {
    return (
      <Card withBorder radius="md" shadow="sm" p="md" h="100%" style={{ flex: 1 }}>
        <Title order={5} tt="uppercase" fw={600} mb="md" size="sm" c="dimmed">
          {t("dashboard.quests.title")}
        </Title>
        <Text c="dimmed" size="sm">
          {t("dashboard.weeklyChallenges.completed")}
        </Text>
      </Card>
    );
  }

  const completed = Math.max(0, insight?.completedThisWeek ?? 0);
  const weeklyTarget = Math.max(0, insight?.weeklyTarget ?? 0);
  const targetForProgress = weeklyTarget > 0 ? weeklyTarget : 1;
  const goalProgress = Math.min(
    100,
    Math.round((completed / targetForProgress) * 100),
  );

  return (
    <Card withBorder radius="md" shadow="sm" p="md" h="100%" style={{ flex: 1 }}>
      <Title order={5} tt="uppercase" fw={600} mb="md" size="sm" c="dimmed">
        {t("dashboard.quests.title")}
      </Title>

      <Stack gap="lg" justify="space-between" style={{ flex: 1 }}>
        {hasGoal && (
          <Stack gap={8}>
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon
                  size={44}
                  radius="xl"
                  color="violet"
                  variant="light"
                  style={{ flexShrink: 0 }}
                >
                  <IconTarget size={22} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fw={600} size="md">
                    {t("dashboard.weeklyGoal.title")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {completed}/{weeklyTarget}
                  </Text>
                </Stack>
              </Group>
              {completed >= weeklyTarget && weeklyTarget > 0 && (
                <Badge size="sm" variant="filled" color="green">
                  ✓
                </Badge>
              )}
            </Group>
            <Progress
              value={goalProgress}
              radius="xl"
              size="md"
              color="violet"
              ml={56}
            />
          </Stack>
        )}

        {hasChallenges &&
          weeklyChallenges!.map((challenge) => (
            <ChallengeRow key={challenge._id} challenge={challenge} />
          ))}
      </Stack>
    </Card>
  );
};

export default DashboardQuestsCard;
