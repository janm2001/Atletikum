import { useState } from "react";
import {
  Table,
  ActionIcon,
  Group,
  Badge,
  Text,
  Collapse,
  Stack,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import type { Workout } from "../../types/Workout/workout";
import { getExerciseName } from "../../types/Workout/workout";

interface WorkoutsTableProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
}

const ExerciseTable = ({ workouts, onEdit, onDelete }: WorkoutsTableProps) => {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!workouts || workouts.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t('admin.workouts.table.empty')}
      </Text>
    );
  }

  const rows = workouts.flatMap((workout) => {
    const isExpanded = expandedIds.has(workout._id);
    const hasExercises = workout.exercises.length > 0;

    return [
      <Table.Tr
        key={workout._id}
        style={{ cursor: hasExercises ? "pointer" : undefined }}
        onClick={() => hasExercises && toggleExpand(workout._id)}
      >
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            {hasExercises &&
              (isExpanded ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              ))}
            <Text size="sm" fw={500}>
              {workout.title}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge color="blue" variant="light">
            {t('admin.workouts.table.levelBadge', { level: workout.requiredLevel })}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed" lineClamp={1}>
            {workout.description}
          </Text>
        </Table.Td>
        <Table.Td>{t('admin.workouts.table.exerciseCount', { count: workout.exercises.length })}</Table.Td>
        <Table.Td>
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(workout);
              }}
              title={t('common.edit')}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workout._id);
              }}
              title={t('common.delete')}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>,
      hasExercises && (
        <Table.Tr key={`${workout._id}-detail`}>
          <Table.Td
            colSpan={5}
            p={0}
            style={{ border: isExpanded ? undefined : "none" }}
          >
            <Collapse in={isExpanded}>
              <Stack gap={0} px="lg" py="sm" bg="dark.7">
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('admin.workouts.exerciseTable.index')}</Table.Th>
                      <Table.Th>{t('admin.workouts.exerciseTable.exercise')}</Table.Th>
                      <Table.Th>{t('admin.workouts.exerciseTable.sets')}</Table.Th>
                      <Table.Th>{t('admin.workouts.exerciseTable.reps')}</Table.Th>
                      <Table.Th>{t('admin.workouts.exerciseTable.rpe')}</Table.Th>
                      <Table.Th>{t('admin.workouts.exerciseTable.progression')}</Table.Th>
                      <Table.Th>{t('admin.workouts.exerciseTable.xp')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {workout.exercises.map((ex, i) => (
                      <Table.Tr key={i}>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {i + 1}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {getExerciseName(ex.exerciseId) ||
                              String(ex.exerciseId)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ex.sets}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ex.reps}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ex.rpe || "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {ex.progression?.enabled
                              ? `${ex.progression.initialWeightKg ?? 0} kg + ${ex.progression.incrementKg} kg`
                              : "—"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" variant="light" color="yellow">
                            {ex.baseXp} XP
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Collapse>
          </Table.Td>
        </Table.Tr>
      ),
    ].filter(Boolean);
  });

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('admin.workouts.table.title')}</Table.Th>
            <Table.Th>{t('admin.workouts.table.level')}</Table.Th>
            <Table.Th>{t('admin.workouts.table.description')}</Table.Th>
            <Table.Th>{t('admin.workouts.table.exerciseCountHeader')}</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>{t('common.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default ExerciseTable;
