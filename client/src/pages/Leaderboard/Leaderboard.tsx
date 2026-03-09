import {
  Avatar,
  Badge,
  Card,
  Center,
  Container,
  Group,
  Table,
  Text,
  Title,
} from "@mantine/core";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import {
  IconCrown,
  IconMedal,
  IconTrophy,
  IconFlame,
} from "@tabler/icons-react";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import { useUser } from "../../hooks/useUser";
import { getLevelFromTotalXp } from "../../utils/leveling";

const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32"] as const;
const podiumIcons = [
  <IconCrown key="1" size={28} color={podiumColors[0]} />,
  <IconMedal key="2" size={24} color={podiumColors[1]} />,
  <IconMedal key="3" size={24} color={podiumColors[2]} />,
];

const Leaderboard = () => {
  const { data, isLoading } = useLeaderboard();
  const { user } = useUser();

  if (isLoading) {
    return <SpinnerComponent />;
  }

  const leaderboard = data?.leaderboard ?? [];
  const myRank = data?.myRank ?? null;
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" align="flex-end" mb="xl">
        <div>
          <Title order={1} mb="xs">
            <IconTrophy
              size={32}
              style={{ verticalAlign: "middle", marginRight: 8 }}
              color="var(--mantine-color-yellow-5)"
            />
            Ljestvica
          </Title>
          <Text c="dimmed">Najbolji sportaši po ukupnim XP bodovima</Text>
        </div>
        {myRank && (
          <Badge size="lg" variant="light" color="violet">
            Vaš rang: #{myRank}
          </Badge>
        )}
      </Group>

      {top3.length > 0 && (
        <Group justify="center" align="flex-end" gap="lg" mb="xl">
          {[1, 0, 2].map((position) => {
            const entry = top3[position];
            if (!entry) return null;

            const isCurrentUser = entry._id === user?._id;
            const height = position === 0 ? 210 : position === 1 ? 180 : 150;

            return (
              <Card
                key={entry._id}
                withBorder
                radius="md"
                shadow={position === 0 ? "lg" : "sm"}
                p="md"
                w={{ base: 110, sm: 140 }}
                style={{
                  height,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: isCurrentUser
                    ? "2px solid var(--mantine-color-violet-5)"
                    : position === 0
                      ? `2px solid ${podiumColors[0]}`
                      : undefined,
                }}
              >
                {podiumIcons[position]}
                <Avatar
                  src={entry.profilePicture}
                  size={position === 0 ? 52 : 40}
                  radius="xl"
                  mt="xs"
                  color="violet"
                >
                  {entry.username.charAt(0).toUpperCase()}
                </Avatar>
                <Text size="sm" fw={700} mt={6} ta="center" truncate w="100%">
                  {entry.username}
                </Text>
                <Badge size="sm" variant="light" color="violet" mt={4}>
                  {entry.totalXp} XP
                </Badge>
                <Text size="xs" c="dimmed">
                  Lvl {getLevelFromTotalXp(entry.totalXp)}
                </Text>
              </Card>
            );
          })}
        </Group>
      )}

      {rest.length > 0 && (
        <Card withBorder radius="md" shadow="sm">
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={60}>Poredak</Table.Th>
                <Table.Th>Korisnik</Table.Th>
                <Table.Th ta="center">Razina</Table.Th>
                <Table.Th ta="center">
                  <IconFlame size={16} style={{ verticalAlign: "middle" }} />{" "}
                  Streak
                </Table.Th>
                <Table.Th ta="right">XP</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rest.map((entry, idx) => {
                const rank = idx + 4;
                const isCurrentUser = entry._id === user?._id;
                return (
                  <Table.Tr
                    key={entry._id}
                    style={
                      isCurrentUser
                        ? {
                            backgroundColor:
                              "var(--mantine-color-violet-light)",
                          }
                        : undefined
                    }
                  >
                    <Table.Td>
                      <Text fw={600}>{rank}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar
                          src={entry.profilePicture}
                          size={32}
                          radius="xl"
                          color="violet"
                        >
                          {entry.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text size="sm" fw={isCurrentUser ? 700 : 400}>
                          {entry.username}
                          {isCurrentUser && (
                            <Text span size="xs" c="dimmed" ml={4}>
                              (vi)
                            </Text>
                          )}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Badge variant="light" color="violet" size="sm">
                        {getLevelFromTotalXp(entry.totalXp)}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="sm">
                        {entry.dailyStreak > 0 ? `${entry.dailyStreak}d` : "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={600}>
                        {entry.totalXp}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {leaderboard.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">Ljestvica je prazna. Budite prvi!</Text>
        </Center>
      )}
    </Container>
  );
};

export default Leaderboard;
