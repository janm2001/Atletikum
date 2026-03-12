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

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('admin.exercises.table.name')}</Table.Th>
            <Table.Th>{t('admin.exercises.table.muscleGroup')}</Table.Th>
            <Table.Th>{t('admin.exercises.table.level')}</Table.Th>
            <Table.Th>{t('admin.exercises.table.media')}</Table.Th>
            <Table.Th>{t('common.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {exercises.map((exercise) => (
            <Table.Tr key={exercise._id}>
              <Table.Td>
                <Text fw={600}>{exercise.title}</Text>
                <Text size="sm" c="dimmed" lineClamp={1}>
                  {exercise.description}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="light">
                  {exercise.muscleGroup.replaceAll("_", " ")}
                </Badge>
              </Table.Td>
              <Table.Td>{exercise.level}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {exercise.imageLink && (
                    <Button
                      component="a"
                      href={exercise.imageLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="xs"
                      variant="light"
                    >
                      {t('admin.exercises.table.image')}
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
                      {t('admin.exercises.table.video')}
                    </Button>
                  )}
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => onEdit(exercise)}
                    aria-label={t('common.edit')}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => onDelete(exercise._id)}
                    aria-label={t('common.delete')}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default ExercisesTable;
