import { Container, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useGamificationStatus } from "@/hooks/useGamification";
import { useWeeklyRecommendations } from "@/hooks/useRecommendations";
import ProfileHeader from "@/components/Profile/ProfileHeader/ProfileHeader";
import ProfileStatsCard from "@/components/Profile/ProfileStatsCard/ProfileStatsCard";
import ProfileAchievements from "@/components/Profile/ProfileAchievements/ProfileAchivements";
import DashboardAlmostLevelUpCard from "@/components/Dashboard/DashboardAlmostLevelUpCard";
import DashboardPersonalBests from "@/components/Dashboard/DashboardPersonalBests";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: gamification } = useGamificationStatus();
  const { data: recommendations } = useWeeklyRecommendations();

  return (
    <Container size="lg" py={{ base: "sm", md: "md" }}>
      <Stack gap="md">
        <ProfileHeader user={user} />

        {user && <ProfileStatsCard user={user} />}

        {gamification && (
          <DashboardAlmostLevelUpCard
            gamification={gamification}
            onDoQuiz={() => navigate("/edukacija")}
            onDoWorkout={() => navigate("/zapis-treninga")}
          />
        )}

        <DashboardPersonalBests
          summaries={recommendations?.personalBestSummaries}
        />

        <ProfileAchievements />
      </Stack>
    </Container>
  );
};

export default Profile;
