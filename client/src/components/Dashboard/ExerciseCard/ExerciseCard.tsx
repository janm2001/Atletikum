import { Badge, Button, Card, Group, Image, Stack, Text } from "@mantine/core";
import type { Exercise } from "../../../types/Exercise/exercise";

interface ExerciseCardProps {
  exercise: Exercise;
}

const getYoutubeThumbnail = (videoLink?: string) => {
  if (!videoLink) {
    return undefined;
  }

  try {
    const url = new URL(videoLink);

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "");
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : undefined;
    }

    if (url.hostname.includes("youtube.com")) {
      const videoIdFromQuery = url.searchParams.get("v");
      if (videoIdFromQuery) {
        return `https://img.youtube.com/vi/${videoIdFromQuery}/hqdefault.jpg`;
      }

      const pathParts = url.pathname.split("/").filter(Boolean);
      const shortsIndex = pathParts.findIndex((part) => part === "shorts");
      if (shortsIndex !== -1 && pathParts[shortsIndex + 1]) {
        return `https://img.youtube.com/vi/${pathParts[shortsIndex + 1]}/hqdefault.jpg`;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const thumbnail = getYoutubeThumbnail(exercise.videoLink);

  return (
    <Card withBorder radius="md" shadow="sm" h="100%">
      <Card.Section>
        <Image
          src={
            thumbnail ||
            exercise.imageLink ||
            "https://placehold.co/800x500?text=Exercise"
          }
          alt={exercise.title}
          h={180}
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
