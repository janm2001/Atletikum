import { Card, Table, Text } from "@mantine/core";
import { IconFlame } from "@tabler/icons-react";
import type { LeaderboardUser } from "@/hooks/useLeaderboard";
import LeaderboardUserProfile from "./LeaderboardUserProfile";

type LeaderboardTableProps = {
  entries: LeaderboardUser[];
  startRank?: number;
  currentUserId?: string;
};

const LeaderboardTable = ({
  entries,
  startRank = 1,
  currentUserId,
}: LeaderboardTableProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Card withBorder radius="md" shadow="sm">
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={60}>Poredak</Table.Th>
            <Table.Th>Korisnik</Table.Th>
            <Table.Th ta="center">Razina</Table.Th>
            <Table.Th ta="center">
              <IconFlame size={16} style={{ verticalAlign: "middle" }} /> Streak
            </Table.Th>
            <Table.Th ta="right">XP</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {entries.map((entry, index) => {
            const rank = startRank + index;
            const isCurrentUser = entry._id === currentUserId;

            return (
              <Table.Tr
                key={entry._id}
                style={
                  isCurrentUser
                    ? { backgroundColor: "var(--mantine-color-violet-light)" }
                    : undefined
                }
              >
                <Table.Td>
                  <Text fw={600}>{rank}</Text>
                </Table.Td>
                <Table.Td>
                  <LeaderboardUserProfile
                    entry={entry}
                    isCurrentUser={isCurrentUser}
                    avatarSize={32}
                    layout="row"
                    levelVariant="none"
                    usernameSize="sm"
                  />
                </Table.Td>
                <Table.Td ta="center">
                  <Text size="sm" fw={600}>
                    {entry.level}
                  </Text>
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
  );
};

export default LeaderboardTable;
