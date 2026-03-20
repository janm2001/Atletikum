import { Anchor, Avatar, Card, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useUser } from "@/hooks/useUser";

const DashboardLeaderboardPeek = () => {
  const { t } = useTranslation();
  const { data: leaderboardData } = useLeaderboard();
  const { user } = useUser();

  if (!leaderboardData?.leaderboard?.length) return null;

  const top3 = leaderboardData.leaderboard.slice(0, 3);

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Text size="sm" tt="uppercase" fw={600} c="dimmed" mb="sm">
        {t("dashboard.leaderboardPeek.title")}
      </Text>

      <Stack gap="sm">
        {top3.map((entry, index) => {
          const isCurrentUser = user?._id === entry._id;
          return (
            <Group
              key={entry._id}
              gap="xs"
              justify="space-between"
              style={
                isCurrentUser
                  ? {
                      backgroundColor: "var(--mantine-color-violet-light)",
                      borderRadius: 8,
                      padding: "4px 8px",
                      margin: "0 -8px",
                    }
                  : undefined
              }
            >
              <Group gap="xs">
                <Text fw={700} size="sm" w={20} ta="center">
                  {index + 1}
                </Text>
                <Avatar
                  src={entry.profilePicture}
                  size={32}
                  radius="xl"
                  color="initials"
                  name={entry.username}
                />
                <Text size="md" fw={isCurrentUser ? 600 : 400}>
                  {entry.username}
                </Text>
              </Group>
              <Text size="md" c="dimmed">
                {entry.totalXp} XP
              </Text>
            </Group>
          );
        })}
      </Stack>

      <Anchor
        component={Link}
        to="/ljestvica"
        size="xs"
        c="dimmed"
        mt="sm"
        display="block"
      >
        {t("dashboard.leaderboardPeek.viewAll")}
      </Anchor>
    </Card>
  );
};

export default DashboardLeaderboardPeek;
