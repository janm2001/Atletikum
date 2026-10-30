import { Badge, Group, Modal, Stack, Text } from "@mantine/core";
import ExerciseDemonstration from "@/components/Exercise/ExerciseDemonstration";
import type { Exercise } from "@/types/Exercise/exercise";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={exercise?.title ?? t('training.track.exerciseDetails')}
      centered
      size="lg"
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
          <ExerciseDemonstration key={exercise._id} title={exercise.title} videoLink={exercise.videoLink} />
        </Stack>
      ) : (
        <Text c="dimmed">{t('training.track.noExerciseDetails')}</Text>
      )}
    </Modal>
  );
};

export default TrackWorkoutExerciseDetailsModal;
