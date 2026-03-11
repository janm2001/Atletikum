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
        Nema dodanih treninga.
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
            Razina {workout.requiredLevel}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed" lineClamp={1}>
            {workout.description}
          </Text>
        </Table.Td>
        <Table.Td>{workout.exercises.length} vježbi</Table.Td>
        <Table.Td>
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(workout);
              }}
              title="Uredi"
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
              title="Obriši"
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
                      <Table.Th>#</Table.Th>
                      <Table.Th>Vježba</Table.Th>
                      <Table.Th>Serije</Table.Th>
                      <Table.Th>Ponavljanja</Table.Th>
                      <Table.Th>RPE</Table.Th>
                      <Table.Th>Progresija</Table.Th>
                      <Table.Th>XP</Table.Th>
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
            <Table.Th>Naslov</Table.Th>
            <Table.Th>Razina</Table.Th>
            <Table.Th>Opis</Table.Th>
            <Table.Th>Broj vježbi</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Akcije</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default ExerciseTable;
