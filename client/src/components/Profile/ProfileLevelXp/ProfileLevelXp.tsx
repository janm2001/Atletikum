import { Box, Flex, Progress, Title, Typography, Text } from "@mantine/core";
import type { User } from "../../../types/User/user";
import {
  getTotalXpForLevelStart,
  getXpRequiredForLevelUp,
} from "@/utils/leveling";

interface ProfileLevelXpProps {
  user: User;
}

const ProfileLevelXp = ({ user }: ProfileLevelXpProps) => {
  const currentLevelStartXp = getTotalXpForLevelStart(user.level);
  const nextLevelRequiredXp = getXpRequiredForLevelUp(user.level);
  const xpInCurrentLevel = Math.max(0, user.totalXp - currentLevelStartXp);
  const xpProgress = Math.min(
    (xpInCurrentLevel / nextLevelRequiredXp) * 100,
    100,
  );

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
          w="40%"
        />
        <Text size="sm" c="dimmed">
          {xpInCurrentLevel}/{nextLevelRequiredXp} XP do Levela {user.level + 1}
        </Text>
      </Flex>
    </Box>
  );
};

export default ProfileLevelXp;
