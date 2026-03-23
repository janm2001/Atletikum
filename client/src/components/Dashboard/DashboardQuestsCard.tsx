import {
  Badge,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconTarget } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { RecommendationInsight } from "@/hooks/useRecommendations";
import type { WeeklyChallenge } from "@/types/Challenge/challenge";
import {
  ChallengeRow,
  type DashboardStitchPalette,
} from "./DashboardChallengeRow";

interface DashboardQuestsCardProps {
  insight: RecommendationInsight | undefined;
  weeklyChallenges: WeeklyChallenge[] | undefined;
}

const DashboardQuestsCard = ({
  insight,
  weeklyChallenges,
}: DashboardQuestsCardProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const mode = computedColorScheme === "dark" ? "dark" : "light";
  const stitch: DashboardStitchPalette = theme.other.stitch[mode];

  const hasGoal = !!insight;
  const hasChallenges = !!(weeklyChallenges && weeklyChallenges.length > 0);

  if (!hasGoal && !hasChallenges) {
    return (
      <Card withBorder radius="md" shadow="sm" p="md">
        <Title
          order={5}
          tt="uppercase"
          fw={700}
          mb="md"
          size="xs"
          c={stitch.textMuted}
        >
          {t("dashboard.quests.title")}
        </Title>
        <Text c={stitch.textMuted} size="sm">
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
    <Card withBorder radius="md" shadow="sm" p="md">
      <Title
        order={5}
        tt="uppercase"
        fw={700}
        mb="sm"
        size="xs"
        c={stitch.textMuted}
      >
        {t("dashboard.quests.title")}
      </Title>

      <Stack gap="sm">
        {hasGoal && (
          <Card
            withBorder
            radius="md"
            p="sm"
            shadow="xs"
            style={{
              backgroundColor: stitch.surfaceInteractive,
              borderColor: stitch.borderSubtle,
            }}
          >
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
                    <Text size="sm" c={stitch.textMuted}>
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
          </Card>
        )}

        {hasChallenges && (
          <Stack gap="lg">
            {weeklyChallenges!.map((challenge) => (
              <ChallengeRow
                key={challenge._id}
                challenge={challenge}
                stitch={stitch}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default DashboardQuestsCard;
