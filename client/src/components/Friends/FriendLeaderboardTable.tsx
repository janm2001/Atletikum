import { Avatar, Badge, Center, Group, Table, Text } from "@mantine/core";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useFriendLeaderboard } from "@/hooks/useFriends";

const FriendLeaderboardTable = () => {
  const { data: friendLeaderboard, isLoading } = useFriendLeaderboard();

  if (isLoading) {
    return <SpinnerComponent size="md" fullHeight={false} />;
  }

  if (!friendLeaderboard || friendLeaderboard.length === 0) {
    return (
      <Center py="md">
        <Text c="dimmed">Nema prijatelja na ljestvici.</Text>
      </Center>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>#</Table.Th>
          <Table.Th>Korisnik</Table.Th>
          <Table.Th>Razina</Table.Th>
          <Table.Th>XP</Table.Th>
          <Table.Th>Streak</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {friendLeaderboard.map((entry) => (
          <Table.Tr
            key={String(entry._id)}
            style={entry.isMe ? { fontWeight: 700 } : undefined}
          >
            <Table.Td>{entry.rank}</Table.Td>
            <Table.Td>
              <Group gap="xs">
                <Avatar size="sm" color="stitch" radius="xl">
                  {entry.username.charAt(0).toUpperCase()}
                </Avatar>
                <Text size="sm">{entry.username}</Text>
                {entry.isMe && (
                  <Badge size="xs" color="stitch">
                    Ti
                  </Badge>
                )}
              </Group>
            </Table.Td>
            <Table.Td>
              <Badge variant="light" color="stitch" size="sm">
                Razina {entry.level}
              </Badge>
            </Table.Td>
            <Table.Td>{entry.totalXp.toLocaleString()} XP</Table.Td>
            <Table.Td>🔥 {entry.dailyStreak}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default FriendLeaderboardTable;
