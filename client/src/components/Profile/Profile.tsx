import { useUser } from "../../hooks/useUser";
import { Avatar, Flex, Title, Container } from "@mantine/core";
import ProfileAchievements from "./ProfileAchievements/ProfileAchivements";
import ProfileLevelXp from "./ProfileLevelXp/ProfileLevelXp";

const Profile = () => {
  const { user } = useUser();

  return (
    <Container size="lg" py="md">
      <Flex direction="column" justify="center" align="center" gap="lg">
        <Title order={1}>Profil</Title>
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
