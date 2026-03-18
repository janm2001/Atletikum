import {
  Avatar,
  Badge,
  Center,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useWeeklyLeaderboard } from "@/hooks/useChallenges";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useUser } from "@/hooks/useUser";

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"] as const;

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

  const weekLabel =
    data.week
      ? `${new Date(data.week.weekStart).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit" })} – ${new Date(data.week.weekEnd).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
      : "";

  const currentUserInTable =
    data.currentUser &&
    data.ranking.some((r) => user?._id === r.userId);

  return (
    <Stack gap="md">
      {weekLabel && (
        <Text size="sm" c="dimmed">
          {t("challenges.weeklyLeaderboard.week", { week: weekLabel })}
        </Text>
      )}

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("leaderboard.table.rank")}</Table.Th>
            <Table.Th>{t("leaderboard.table.user")}</Table.Th>
            <Table.Th>{t("challenges.weeklyLeaderboard.completed")}</Table.Th>
            <Table.Th>{t("challenges.weeklyLeaderboard.xp")}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.ranking.map((entry) => {
            const isMe = user?._id === entry.userId;
            return (
              <Table.Tr
                key={entry.userId}
                style={isMe ? { fontWeight: 600 } : undefined}
              >
                <Table.Td>
                  {entry.rank <= 3 ? (
                    <ThemeIcon
                      size="sm"
                      radius="xl"
                      style={{ background: MEDAL_COLORS[entry.rank - 1] }}
                      variant="filled"
                    >
                      <IconTrophy size={12} />
                    </ThemeIcon>
                  ) : (
                    <Text size="sm" c="dimmed">
                      {entry.rank}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Avatar src={entry.profilePicture} size="sm" radius="xl">
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
                <Table.Td>
                  <Badge size="sm" variant="light" color="violet">
                    {entry.completedChallenges}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{entry.xpFromChallenges} XP</Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

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
