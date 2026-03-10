import { Badge, Button, Group, Modal, Stack, Text } from "@mantine/core";
import type { Exercise } from "@/types/Exercise/exercise";

type TrackWorkoutExerciseDetailsModalProps = {
  exercise?: Exercise;
  opened: boolean;
  onClose: () => void;
};

const TrackWorkoutExerciseDetailsModal = ({
  exercise,
  opened,
  onClose,
}: TrackWorkoutExerciseDetailsModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={exercise?.title ?? "Detalji vježbe"}
      centered
    >
      {exercise ? (
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            {exercise.description}
          </Text>
          <Group gap="xs">
            <Badge variant="dot" color="gray">
              {exercise.muscleGroup}
            </Badge>
            <Badge variant="light" color="violet">
              Lvl {exercise.level}
            </Badge>
          </Group>
          {exercise.videoLink && (
            <Button
              component="a"
              href={exercise.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
            >
              Pogledaj video
            </Button>
          )}
        </Stack>
      ) : (
        <Text c="dimmed">Detalji vježbe nisu dostupni.</Text>
      )}
    </Modal>
  );
};

export default TrackWorkoutExerciseDetailsModal;
