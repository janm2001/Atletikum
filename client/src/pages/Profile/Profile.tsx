import { useUser } from "@/hooks/useUser";
import { Avatar, Container, Flex, Stack, Title } from "@mantine/core";
import ProfileAchievements from "@/components/Profile/ProfileAchievements/ProfileAchivements";
import ProfileLevelXp from "@/components/Profile/ProfileLevelXp/ProfileLevelXp";
import ProfileSecurity from "@/components/Profile/ProfileSecurity/ProfileSecurity";
import { XpProgressSection } from "@/components/XpProgress/XpProgressSection";
import DashboardAlmostLevelUpCard from "@/components/Dashboard/DashboardAlmostLevelUpCard";
import DashboardPersonalBests from "@/components/Dashboard/DashboardPersonalBests";
import { useGamificationStatus } from "@/hooks/useGamification";
import { useWeeklyRecommendations } from "@/hooks/useRecommendations";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: gamification } = useGamificationStatus();
  const { data: recommendations } = useWeeklyRecommendations();

  return (
    <Container size="lg" py="md">
      <Flex direction="column" justify="center" align="center" gap="lg">
        <Title order={1}>{t('profile.title')}</Title>
        <ProfileSecurity user={user} />
        <Avatar
          size={125}
          color="initials"
          name={user?.username}
          alt={user?.username}
        />

        <ProfileLevelXp user={user!} />

        <Stack gap="lg" w="100%">
          <XpProgressSection variant="full" />

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
        </Stack>

        <ProfileAchievements />
      </Flex>
    </Container>
  );
};

export default Profile;
