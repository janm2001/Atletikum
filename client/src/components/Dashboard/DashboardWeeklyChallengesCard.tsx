import {
  Badge,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBrain,
  IconBarbell,
  IconBook,
  IconCheck,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { WeeklyChallenge } from "@/types/Challenge/challenge";

interface DashboardWeeklyChallengesCardProps {
  challenges: WeeklyChallenge[];
}

const CHALLENGE_CONFIG = {
  quiz: {
    icon: IconBrain,
    color: "blue",
  },
  workout: {
    icon: IconBarbell,
    color: "violet",
  },
  reading: {
    icon: IconBook,
    color: "teal",
  },
} as const;

const getCountdown = (weekEnd: string): string => {
  const now = new Date();
  const end = new Date(weekEnd);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "0h";
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return `${hours}h`;
};

const ChallengeCategoryLabel: Record<WeeklyChallenge["type"], string> = {
  quiz: "dashboard.weeklyChallenges.typeQuiz",
  workout: "dashboard.weeklyChallenges.typeWorkout",
  reading: "dashboard.weeklyChallenges.typeReading",
};

interface ChallengeRowProps {
  challenge: WeeklyChallenge;
}

const ChallengeRow = ({ challenge }: ChallengeRowProps) => {
  const { t } = useTranslation();
  const config = CHALLENGE_CONFIG[challenge.type];
  const Icon = config.icon;
  const progress = Math.min(
    100,
    Math.round((challenge.currentCount / challenge.targetCount) * 100),
  );

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <ThemeIcon
            size="sm"
            radius="sm"
            color={challenge.completed ? "green" : config.color}
            variant="light"
          >
            {challenge.completed ? <IconCheck size={14} /> : <Icon size={14} />}
          </ThemeIcon>
          <Text fw={500} size="sm">
            {t(ChallengeCategoryLabel[challenge.type])}
          </Text>
        </Group>
        <Group gap="xs">
          <Badge
            size="sm"
            variant="light"
            color={challenge.xpAwarded ? "green" : "yellow"}
          >
            {challenge.xpAwarded
              ? t("dashboard.weeklyChallenges.rewardClaimed")
              : `+${challenge.xpReward} XP`}
          </Badge>
        </Group>
      </Group>

      <Progress
        value={progress}
        color={challenge.completed ? "green" : config.color}
        radius="xl"
        size="sm"
      />

      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {challenge.completed
            ? t("dashboard.weeklyChallenges.completed")
            : t("dashboard.weeklyChallenges.progress", {
                current: challenge.currentCount,
                total: challenge.targetCount,
              })}
        </Text>
        {!challenge.completed && (
          <Text size="xs" c="dimmed">
            {t("dashboard.weeklyChallenges.timeLeft", {
              time: getCountdown(challenge.weekEnd),
            })}
          </Text>
        )}
      </Group>
    </Stack>
  );
};

const DashboardWeeklyChallengesCard = ({
  challenges,
}: DashboardWeeklyChallengesCardProps) => {
  const { t } = useTranslation();

  if (!challenges || challenges.length === 0) {
    return null;
  }

  const countdown = getCountdown(challenges[0].weekEnd);

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Title order={4}>{t("dashboard.weeklyChallenges.title")}</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {t("dashboard.weeklyChallenges.subtitle", { time: countdown })}
          </Text>
        </div>
        <Badge color="violet" variant="light" size="sm">
          {t("dashboard.weeklyChallenges.weekBadge")}
        </Badge>
      </Group>

      <Stack gap="md">
        {challenges.map((challenge) => (
          <ChallengeRow key={challenge._id} challenge={challenge} />
        ))}
      </Stack>
    </Card>
  );
};

export default DashboardWeeklyChallengesCard;
