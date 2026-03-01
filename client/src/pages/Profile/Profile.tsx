import { useUser } from "../../hooks/useUser";
import {
  Avatar,
  Flex,
  Progress,
  Title,
  Text,
  Typography,
  Container,
} from "@mantine/core";
import ProfileAchievements from "./ProfileAchievements/ProfileAchivements";

const Profile = () => {
  const { user } = useUser();
  const xpPerLevel = 300;
  const xpProgress = user
    ? Math.min((user.totalXp / xpPerLevel) * 100, 100)
    : 0;

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
        <Title order={3}>Level {user?.level}</Title>

        <Flex direction="column" align="center" gap="xs" w="100%" maw={400}>
          <Typography>XP Napredak</Typography>
          <Progress
            radius="xl"
            size="lg"
            value={xpProgress}
            color="violet"
            w="100%"
          />
          <Text size="sm" c="dimmed">
            {user!.totalXp}/{xpPerLevel} XP
          </Text>
        </Flex>

        <ProfileAchievements />
      </Flex>
    </Container>
  );
};

export default Profile;
