import { useState } from "react";
import { Card, Pagination, Stack, Table, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconFlame } from "@tabler/icons-react";
import type { LeaderboardUser } from "@/hooks/useLeaderboard";
import LeaderboardUserProfile from "./LeaderboardUserProfile";

const PAGE_SIZE = 10;

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
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  if (entries.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const paginatedEntries = entries.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <Stack gap="sm">
      <Card withBorder radius="md" shadow="sm">
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>{t("leaderboard.table.rank")}</Table.Th>
              <Table.Th>{t("leaderboard.table.user")}</Table.Th>
              <Table.Th ta="center" visibleFrom="sm">
                {t("leaderboard.table.level")}
              </Table.Th>
              <Table.Th ta="center" visibleFrom="sm">
                <IconFlame size={16} style={{ verticalAlign: "middle" }} />{" "}
                {t("leaderboard.table.streak")}
              </Table.Th>
              <Table.Th ta="right">{t("common.xp")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedEntries.map((entry, index) => {
              const rank = startRank + (page - 1) * PAGE_SIZE + index;
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
                  <Table.Td ta="center" visibleFrom="sm">
                    <Text size="sm" fw={600}>
                      {entry.level}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center" visibleFrom="sm">
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

      {totalPages > 1 && (
        <Pagination
          value={page}
          onChange={setPage}
          total={totalPages}
          size="sm"
        />
      )}
    </Stack>
  );
};

export default LeaderboardTable;
