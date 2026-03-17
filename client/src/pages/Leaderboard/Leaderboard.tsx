import { Center, Container, Text } from "@mantine/core";
import LeaderboardHeader from "@/components/Leaderboard/LeaderboardHeader";
import LeaderboardPodium from "@/components/Leaderboard/LeaderboardPodium";
import LeaderboardTable from "@/components/Leaderboard/LeaderboardTable";
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
  const top3 = leaderboard.slice(0, 3);

  return (
    <Container size="md" py="xl">
      <LeaderboardHeader myRank={myRank} />

      <LeaderboardPodium entries={top3} currentUserId={user?._id} />

      <LeaderboardTable
        entries={leaderboard}
        startRank={1}
        currentUserId={user?._id}
      />

      {leaderboard.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">{t('leaderboard.empty')}</Text>
        </Center>
      )}
    </Container>
  );
};

export default Leaderboard;
