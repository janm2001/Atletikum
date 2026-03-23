import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Workout } from "@/types/Workout/workout";
import { getExerciseImage } from "@/types/Workout/workout";
import classes from "./DashboardTrainingRecommendation.module.css";

interface DashboardTrainingRecommendationProps {
  workout: Workout | null;
  onStart: (id: string) => void;
}

const DashboardTrainingRecommendation = ({
  workout,
  onStart,
}: DashboardTrainingRecommendationProps) => {
  const { t } = useTranslation();

  if (!workout) {
    return (
      <Card
        withBorder
        radius="md"
        shadow="sm"
        p="md"
        className={classes.emptyCard}
      >
        <Text c="dimmed" size="sm" ta="center">
          {t("dashboard.trainingRec.empty")}
        </Text>
      </Card>
    );
  }

  const heroImage = workout.exercises[0]
    ? getExerciseImage(workout.exercises[0].exerciseId)
    : undefined;

  const totalBaseXp = workout.exercises.reduce(
    (sum, ex) => sum + (ex.baseXp ?? 0),
    0,
  );

  const estimatedMinutes = workout.exercises.length * 4;

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      h="100%"
      mih="300px"
      p={0}
      className={classes.card}
    >
      {heroImage ? (
        <Box
          component="img"
          src={heroImage}
          alt=""
          className={classes.heroImage}
        />
      ) : (
        <Box className={classes.fallbackBg} />
      )}

      <Box className={classes.overlay} />

      <Stack
        p="lg"
        gap="sm"
        justify="flex-end"
        h="100%"
        className={classes.content}
      >
        <div>
          <Text size="sm" tt="uppercase" c="dimmed" fw={600} mb={4}>
            {t("dashboard.trainingRec.title")}
          </Text>
          <Title order={2} fw={700} c="white">
            {workout.title}
          </Title>
        </div>

        <Group gap="xs">
          <Text size="sm" c="gray.3">
            {t("dashboard.trainingRec.duration", { count: estimatedMinutes })}
          </Text>
          <Text size="sm" c="gray.3">
            ·
          </Text>
          <Badge variant="filled" color="yellow" size="sm">
            {totalBaseXp} XP
          </Badge>
        </Group>

        <Button
          fullWidth
          variant="gradient"
          gradient={{ from: "violet", to: "grape", deg: 135 }}
          size="md"
          mt={4}
          onClick={() => onStart(workout._id)}
        >
          {t("dashboard.trainingRec.start")}
        </Button>
      </Stack>
    </Card>
  );
};

export default DashboardTrainingRecommendation;
