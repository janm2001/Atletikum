import { Table, ActionIcon, Group, Badge, Text } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Workout } from "../../types/Workout/workout";

interface WorkoutsTableProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
}

const WorkoutsTable = ({ workouts, onEdit, onDelete }: WorkoutsTableProps) => {
  if (!workouts || workouts.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Nema dodanih treninga.
      </Text>
    );
  }

  const rows = workouts.map((workout) => (
    <Table.Tr key={workout._id}>
      <Table.Td>
        <Text size="sm" fw={500}>
          {workout.title}
        </Text>
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
            onClick={() => onEdit(workout)}
            title="Uredi"
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            onClick={() => onDelete(workout._id)}
            title="Obriši"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

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

export default WorkoutsTable;
