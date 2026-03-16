import { Box, Flex, Progress, Title, Typography, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { User } from "../../../types/User/user";
import { getXpProgress } from "@/utils/leveling";

interface ProfileLevelXpProps {
  user: User;
}

const ProfileLevelXp = ({ user }: ProfileLevelXpProps) => {
  const { t } = useTranslation();
  const { xpInLevel: xpInCurrentLevel, xpForNext: nextLevelRequiredXp, percent: xpProgress } = getXpProgress(user.level, user.totalXp);

  return (
    <Box w="100%">
      <Title order={3} ta="center">
        {t('nav.levelBadge', { level: user?.level })}
      </Title>

      <Flex direction="column" align="center" gap="xs" w="100%">
        <Typography>{t('profile.level.title')}</Typography>
        <Progress
          radius="xl"
          size="lg"
          value={xpProgress}
          color="violet"
          w="40%"
        />
        <Text size="sm" c="dimmed">
          {t('profile.level.progress', { current: xpInCurrentLevel, total: nextLevelRequiredXp, level: user.level + 1 })}
        </Text>
      </Flex>
    </Box>
  );
};

export default ProfileLevelXp;
