import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { CelebrationPersonalBest } from "@/types/Celebration/celebration";
import { formatCompletedExerciseResult } from "@/types/WorkoutLog/workoutLog";

interface CelebrationPersonalBestsCardProps {
  personalBests: CelebrationPersonalBest[];
}

const CelebrationPersonalBestsCard = ({
  personalBests,
}: CelebrationPersonalBestsCardProps) => {
  const { t } = useTranslation();

  if (personalBests.length === 0) return null;

  return (
    <Card withBorder radius="lg" shadow="sm" p="xl" w="100%">
      <Stack align="center" gap="md">
        <Group gap="xs">
          <IconTrophy size={24} color="var(--mantine-color-orange-5)" />
          <Title order={3}>{t("celebration.personalBests")}</Title>
        </Group>

        {personalBests.map((personalBest, index) => (
          <Card
            key={`${personalBest.exerciseId}-${index}`}
            withBorder
            radius="md"
            p="md"
            w="100%"
            style={{
              borderColor: "var(--mantine-color-orange-5)",
              backgroundColor: "var(--mantine-color-orange-light)",
            }}
          >
            <Group justify="space-between" align="center">
              <div>
                <Text fw={700}>
                  {personalBest.exerciseName ??
                    t("training.logs.unknownExercise")}
                </Text>
                <Text size="sm" c="dimmed">
                  {formatCompletedExerciseResult(personalBest)} ·{" "}
                  {t("common.rpeLabel", { value: personalBest.rpe })}
                </Text>
              </div>
              <Badge color="orange" variant="light">
                {t("training.logs.newPR")}
              </Badge>
            </Group>
          </Card>
        ))}
      </Stack>
    </Card>
  );
};

export default CelebrationPersonalBestsCard;
