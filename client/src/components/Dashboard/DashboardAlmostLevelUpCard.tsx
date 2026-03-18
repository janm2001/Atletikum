import {
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconStar, IconBrain, IconBarbell } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { GamificationStatus } from "@/types/User/gamification";

interface DashboardAlmostLevelUpCardProps {
  gamification: GamificationStatus;
  onDoQuiz: () => void;
  onDoWorkout: () => void;
}

const DashboardAlmostLevelUpCard = ({
  gamification,
  onDoQuiz,
  onDoWorkout,
}: DashboardAlmostLevelUpCardProps) => {
  const { t } = useTranslation();

  if (gamification.currentLevelProgress < 50) {
    return null;
  }

  const suggestQuiz = gamification.fastestXpAction === "quiz";

  return (
    <Card withBorder radius="md" shadow="sm" p="lg">
      <Stack gap="sm">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" color="yellow" variant="light">
            <IconStar size={20} />
          </ThemeIcon>
          <Title order={4}>{t("dashboard.almostLevelUp.title")}</Title>
        </Group>

        <Progress
          value={gamification.currentLevelProgress}
          color="violet"
          radius="xl"
          size="lg"
        />

        <Text size="sm" c="dimmed">
          {t("dashboard.almostLevelUp.xpRemaining", {
            xp: gamification.xpToNextLevel,
            level: gamification.level + 1,
          })}
        </Text>

        <Group gap="sm" mt="xs">
          {suggestQuiz ? (
            <>
              <Button
                leftSection={<IconBrain size={16} />}
                variant="gradient"
                gradient={{ from: "blue", to: "violet", deg: 135 }}
                size="sm"
                onClick={onDoQuiz}
              >
                {t("dashboard.almostLevelUp.doQuiz")}
              </Button>
              <Button
                leftSection={<IconBarbell size={16} />}
                variant="light"
                color="violet"
                size="sm"
                onClick={onDoWorkout}
              >
                {t("dashboard.almostLevelUp.doWorkout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                leftSection={<IconBarbell size={16} />}
                variant="gradient"
                gradient={{ from: "violet", to: "grape", deg: 135 }}
                size="sm"
                onClick={onDoWorkout}
              >
                {t("dashboard.almostLevelUp.doWorkout")}
              </Button>
              <Button
                leftSection={<IconBrain size={16} />}
                variant="light"
                color="blue"
                size="sm"
                onClick={onDoQuiz}
              >
                {t("dashboard.almostLevelUp.doQuiz")}
              </Button>
            </>
          )}
        </Group>

        <Text size="xs" c="dimmed">
          {suggestQuiz
            ? t("dashboard.almostLevelUp.quizHint")
            : t("dashboard.almostLevelUp.workoutHint")}
        </Text>
      </Stack>
    </Card>
  );
};

export default DashboardAlmostLevelUpCard;
