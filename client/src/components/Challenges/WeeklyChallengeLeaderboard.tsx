import {
  Avatar,
  Card,
  Center,
  Group,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useWeeklyLeaderboard } from "@/hooks/useChallenges";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useUser } from "@/hooks/useUser";

const WeeklyChallengeLeaderboard = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useWeeklyLeaderboard({ limit: 50 });
  const { user } = useUser();

  if (isLoading) return <SpinnerComponent />;

  if (!data || data.ranking.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">{t("challenges.weeklyLeaderboard.empty")}</Text>
      </Center>
    );
  }

  const weekLabel = data.week
    ? `${new Date(data.week.weekStart).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit" })} – ${new Date(data.week.weekEnd).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
    : "";

  const currentUserInTable =
    data.currentUser && data.ranking.some((r) => user?._id === r.userId);

  return (
    <Stack gap="md">
      {weekLabel && (
        <Text size="sm" c="dimmed">
          {t("challenges.weeklyLeaderboard.week", { week: weekLabel })}
        </Text>
      )}

      <Card withBorder radius="md" shadow="sm" p={0}>
        <Table.ScrollContainer minWidth={420}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={60}>{t("leaderboard.table.rank")}</Table.Th>
                <Table.Th>{t("leaderboard.table.user")}</Table.Th>
                <Table.Th ta="center">{t("challenges.weeklyLeaderboard.completed")}</Table.Th>
                <Table.Th ta="right">{t("challenges.weeklyLeaderboard.xp")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.ranking.map((entry) => {
                const isMe = user?._id === entry.userId;
                return (
                  <Table.Tr
                    key={entry.userId}
                    style={
                      isMe
                        ? { backgroundColor: "var(--mantine-color-violet-light)" }
                        : undefined
                    }
                  >
                    <Table.Td>
                      <Text fw={600}>{entry.rank}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Avatar src={entry.profilePicture} size={32} radius="xl">
                          {entry.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text size="sm">
                          {entry.username}
                          {isMe && (
                            <Text span c="dimmed" size="xs" ml={4}>
                              {t("leaderboard.you")}
                            </Text>
                          )}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="sm" fw={600}>
                        {entry.completedChallenges}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={600}>
                        {entry.xpFromChallenges}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      {data.currentUser && !currentUserInTable && (
        <Paper withBorder p="sm" radius="md">
          <Group justify="space-between">
            <Text size="sm">
              {t("challenges.weeklyLeaderboard.yourPosition", {
                rank: data.currentUser.rank,
              })}
            </Text>
            {data.currentUser.gapToNextRank > 0 && (
              <Text size="xs" c="dimmed">
                {t("challenges.weeklyLeaderboard.gap", {
                  count: data.currentUser.gapToNextRank,
                })}
              </Text>
            )}
          </Group>
        </Paper>
      )}
    </Stack>
  );
};

export default WeeklyChallengeLeaderboard;
