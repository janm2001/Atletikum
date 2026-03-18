import { ActionIcon, Badge, Button, Group, Table, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Exercise } from "../../types/Exercise/exercise";

interface ExercisesTableProps {
  exercises: Exercise[];
  onEdit: (exercise: Exercise) => void;
  onDelete: (exerciseId: string) => void;
}

const ExercisesTable = ({
  exercises,
  onEdit,
  onDelete,
}: ExercisesTableProps) => {
  const { t } = useTranslation();

  const tableData = {
    head: [
      t("admin.exercises.table.name"),
      t("admin.exercises.table.muscleGroup"),
      t("admin.exercises.table.level"),
      t("admin.exercises.table.media"),
      t("common.actions"),
    ],
    body: exercises.map((exercise) => [
      <div key="name">
        <Text fw={600}>{exercise.title}</Text>
        <Text size="sm" c="dimmed" lineClamp={1}>
          {exercise.description}
        </Text>
      </div>,
      <Badge key="muscle" variant="light">
        {exercise.muscleGroup.replaceAll("_", " ")}
      </Badge>,
      exercise.level,
      <Group gap="xs" key="media">
        {exercise.imageLink && (
          <Button
            component="a"
            href={exercise.imageLink}
            target="_blank"
            rel="noopener noreferrer"
            size="xs"
            variant="light"
          >
            {t("admin.exercises.table.image")}
          </Button>
        )}
        {exercise.videoLink && (
          <Button
            component="a"
            href={exercise.videoLink}
            target="_blank"
            rel="noopener noreferrer"
            size="xs"
            variant="light"
          >
            {t("admin.exercises.table.video")}
          </Button>
        )}
      </Group>,
      <Group gap="xs" key="actions">
        <ActionIcon
          variant="subtle"
          color="blue"
          onClick={() => onEdit(exercise)}
          aria-label={t("common.edit")}
        >
          <IconEdit size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => onDelete(exercise._id)}
          aria-label={t("common.delete")}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>,
    ]),
  };

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table
        striped
        highlightOnHover
        withTableBorder
        data={tableData}
      />
    </Table.ScrollContainer>
  );
};

export default ExercisesTable;
