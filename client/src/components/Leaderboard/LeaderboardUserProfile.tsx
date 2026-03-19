import { Avatar, Badge, Box, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { LeaderboardUser } from "@/hooks/useLeaderboard";
import { getLevelFromTotalXp } from "@/utils/leveling";

type LeaderboardUserProfileProps = {
  entry: LeaderboardUser;
  isCurrentUser: boolean;
  avatarSize?: number;
  layout?: "row" | "column";
  levelVariant?: "badge" | "text" | "none";
  usernameSize?: string;
};

const LeaderboardUserProfile = ({
  entry,
  isCurrentUser,
  avatarSize = 32,
  layout = "row",
  levelVariant = "badge",
  usernameSize = "sm",
}: LeaderboardUserProfileProps) => {
  const { t } = useTranslation();
  const level = getLevelFromTotalXp(entry.totalXp);
  const levelDisplay =
    levelVariant === "badge" ? (
      <Badge variant="light" color="violet" size="sm">
        {t('common.levelBadge', { level })}
      </Badge>
    ) : levelVariant === "text" ? (
      <Text size="xs" c="dimmed">
        {t('common.levelBadge', { level })}
      </Text>
    ) : null;

  if (layout === "column") {
    return (
      <Stack align="center" gap={4}>
        <Avatar
          src={entry.profilePicture}
          size={avatarSize}
          radius="xl"
          color="violet"
        >
          {entry.username.charAt(0).toUpperCase()}
        </Avatar>
        <Text size={usernameSize} fw={700} ta="center" truncate w="100%">
          {entry.username}
        </Text>
        {levelDisplay}
      </Stack>
    );
  }

  return (
    <Group gap="sm" wrap="nowrap">
      <Box visibleFrom="sm">
        <Avatar
          src={entry.profilePicture}
          size={avatarSize}
          radius="xl"
          color="violet"
        >
          {entry.username.charAt(0).toUpperCase()}
        </Avatar>
      </Box>
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Text size={usernameSize} fw={isCurrentUser ? 700 : 400} truncate>
          {entry.username}
          {isCurrentUser && (
            <Text span size="xs" c="dimmed" ml={4}>
              {t('leaderboard.you')}
            </Text>
          )}
        </Text>
        {levelDisplay}
      </Stack>
    </Group>
  );
};

export default LeaderboardUserProfile;
