import { Box, Flex, Progress, Title, Typography, Text } from "@mantine/core";
import type { User } from "../../../types/User/user";

interface ProfileLevelXpProps {
  user: User;
}

const ProfileLevelXp = ({ user }: ProfileLevelXpProps) => {
  const xpPerLevel = 300;
  const xpProgress = user
    ? Math.min((user.totalXp / xpPerLevel) * 100, 100)
    : 0;
  return (
    <Box w="100%">
      <Title order={3} ta="center">
        Level {user?.level}
      </Title>

      <Flex direction="column" align="center" gap="xs" w="100%">
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
    </Box>
  );
};

export default ProfileLevelXp;
