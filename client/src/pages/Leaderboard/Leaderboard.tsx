import { Avatar, Badge, Center, Container, Group, Stack, Table, Tabs, Text } from "@mantine/core";
import LeaderboardHeader from "@/components/Leaderboard/LeaderboardHeader";
import LeaderboardPodium from "@/components/Leaderboard/LeaderboardPodium";
import LeaderboardTable from "@/components/Leaderboard/LeaderboardTable";
import LeaderboardChaseCard from "@/components/Leaderboard/LeaderboardChaseCard";
import WeeklyChallengeLeaderboard from "@/components/Challenges/WeeklyChallengeLeaderboard";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import QueryErrorMessage from "@/components/Common/QueryErrorMessage";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useFriendLeaderboard } from "@/hooks/useFriends";
import { useUser } from "@/hooks/useUser";
import { useTrackLeaderboardVisit } from "@/hooks/useDailyMissions";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const Leaderboard = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useLeaderboard();
  const { user } = useUser();
  const { data: friendLeaderboard, isLoading: friendsLoading } = useFriendLeaderboard();
  const trackLeaderboard = useTrackLeaderboardVisit();

  useEffect(() => {
    trackLeaderboard.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <SpinnerComponent />;
  }

  if (error) {
    return (
      <Container size="xl" py={{ base: "sm", md: "md" }}>
        <QueryErrorMessage message={t("leaderboard.error")} />
      </Container>
    );
  }

  const leaderboard = data?.leaderboard ?? [];
  const myRank = data?.myRank ?? null;
  const nextRankUser = data?.nextRankUser ?? null;
  const xpGapToNextRank = data?.xpGapToNextRank ?? null;
  const top3 = leaderboard.slice(0, 3);

  return (
    <Container size="xl" py={{ base: "sm", md: "md" }}>
      <LeaderboardHeader myRank={myRank} />

      <Tabs defaultValue="overall" mt="md">
        <Tabs.List mb="md" grow>
          <Tabs.Tab value="overall">{t("leaderboard.tabs.overall")}</Tabs.Tab>
          <Tabs.Tab value="weekly">{t("leaderboard.tabs.weekly")}</Tabs.Tab>
          <Tabs.Tab value="friends">Prijatelji</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overall">
          {nextRankUser && xpGapToNextRank !== null && xpGapToNextRank > 0 && (
            <LeaderboardChaseCard
              nextRankUser={nextRankUser}
              xpGap={xpGapToNextRank}
            />
          )}

          <LeaderboardPodium entries={top3} currentUserId={user?._id} />

          <LeaderboardTable
            entries={leaderboard}
            startRank={1}
            currentUserId={user?._id}
            nextRankUsername={nextRankUser?.username}
          />

          {leaderboard.length === 0 && (
            <Center py="xl">
              <Text c="dimmed">{t("leaderboard.empty")}</Text>
            </Center>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="weekly">
          <WeeklyChallengeLeaderboard />
        </Tabs.Panel>

        <Tabs.Panel value="friends">
          {friendsLoading ? (
            <SpinnerComponent size="md" fullHeight={false} />
          ) : !friendLeaderboard || friendLeaderboard.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <Text c="dimmed">Nema prijatelja na ljestvici.</Text>
                <Text size="sm" c="dimmed">Dodaj prijatelje na stranici Prijatelji.</Text>
              </Stack>
            </Center>
          ) : (
            <Table striped highlightOnHover mt="md">
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
                        {entry.isMe && <Badge size="xs" color="stitch">Ti</Badge>}
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
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Leaderboard;
