import { useUser } from "@/hooks/useUser";
import { Avatar, Container, Flex, Title } from "@mantine/core";
import ProfileAchievements from "@/components/Profile/ProfileAchievements/ProfileAchivements";
import ProfileLevelXp from "@/components/Profile/ProfileLevelXp/ProfileLevelXp";
import ProfileSecurity from "@/components/Profile/ProfileSecurity/ProfileSecurity";

const Profile = () => {
  const { user } = useUser();

  return (
    <Container size="lg" py="md">
      <Flex direction="column" justify="center" align="center" gap="lg">
        <Title order={1}>Profil</Title>
        <ProfileSecurity user={user} />
        <Avatar
          size={125}
          color="initials"
          name={user?.username}
          alt={user?.username}
        />

        <ProfileLevelXp user={user!} />

        <ProfileAchievements />
      </Flex>
    </Container>
  );
};

export default Profile;
