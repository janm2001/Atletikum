import { Center, Container, Tabs, Text } from "@mantine/core";
import LeaderboardHeader from "@/components/Leaderboard/LeaderboardHeader";
import LeaderboardPodium from "@/components/Leaderboard/LeaderboardPodium";
import LeaderboardTable from "@/components/Leaderboard/LeaderboardTable";
import LeaderboardChaseCard from "@/components/Leaderboard/LeaderboardChaseCard";
import WeeklyChallengeLeaderboard from "@/components/Challenges/WeeklyChallengeLeaderboard";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "react-i18next";

const Leaderboard = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useLeaderboard();
  const { user } = useUser();

  if (isLoading) {
    return <SpinnerComponent />;
  }

  const leaderboard = data?.leaderboard ?? [];
  const myRank = data?.myRank ?? null;
  const nextRankUser = data?.nextRankUser ?? null;
  const xpGapToNextRank = data?.xpGapToNextRank ?? null;
  const top3 = leaderboard.slice(0, 3);

  return (
    <Container size="md" py="xl">
      <LeaderboardHeader myRank={myRank} />

      <Tabs defaultValue="overall" mt="md">
        <Tabs.List mb="md">
          <Tabs.Tab value="overall">{t("leaderboard.tabs.overall")}</Tabs.Tab>
          <Tabs.Tab value="weekly">{t("leaderboard.tabs.weekly")}</Tabs.Tab>
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
      </Tabs>
    </Container>
  );
};

export default Leaderboard;
