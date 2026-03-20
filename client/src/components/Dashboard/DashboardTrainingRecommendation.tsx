import { Badge, Box, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Workout } from "@/types/Workout/workout";
import { getExerciseImage } from "@/types/Workout/workout";

interface DashboardTrainingRecommendationProps {
  workout: Workout | null;
  onStart: (id: string) => void;
}

const FALLBACK_BG =
  "linear-gradient(135deg, var(--mantine-color-violet-8) 0%, var(--mantine-color-grape-8) 100%)";

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
        h="100%"
        style={{
          backgroundImage: FALLBACK_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
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
      p={0}
      h="100%"
      mih={320}
      style={{ overflow: "hidden", position: "relative", flex: 1 }}
    >
      {/* Background: image if available, otherwise gradient */}
      {heroImage ? (
        <Box
          component="img"
          src={heroImage}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      ) : (
        <Box
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: FALLBACK_BG,
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* Content */}
      <Stack
        p="lg"
        gap="sm"
        justify="flex-end"
        h="100%"
        style={{ position: "relative", zIndex: 1 }}
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
          <Text size="sm" c="gray.3">·</Text>
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
