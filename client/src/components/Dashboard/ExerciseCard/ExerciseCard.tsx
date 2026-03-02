import { Badge, Button, Card, Group, Image, Stack, Text } from "@mantine/core";
import type { Exercise } from "../../../types/Exercise/exercise";

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  return (
    <Card withBorder radius="md" shadow="sm" h="100%">
      <Card.Section>
        <Image
          src={
            exercise.imageLink || "https://placehold.co/800x500?text=Exercise"
          }
          alt={exercise.title}
          h={350}
          fit="cover"
        />
      </Card.Section>

      <Stack gap="xs" mt="sm">
        <Group justify="space-between" align="flex-start">
          <Text fw={700}>{exercise.title}</Text>
          <Badge variant="light" color="violet">
            Lvl {exercise.level}
          </Badge>
        </Group>

        <Badge variant="dot" color="gray" w="fit-content">
          {exercise.muscleGroup}
        </Badge>

        <Text size="sm" c="dimmed" lineClamp={3}>
          {exercise.description}
        </Text>

        {exercise.videoLink && (
          <Button
            component="a"
            href={exercise.videoLink}
            target="_blank"
            rel="noopener noreferrer"
            variant="light"
            mt="xs"
          >
            Pogledaj video
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default ExerciseCard;
