import { Box, Stack, Text, Badge, Group } from "@mantine/core";
import { forwardRef } from "react";

export type ShareCardType = "level_up" | "achievement" | "streak";

interface ShareCardTemplateProps {
  type: ShareCardType;
  username: string;
  level?: number;
  totalXp?: number;
  achievementTitle?: string;
  streak?: number;
}

const ShareCardTemplate = forwardRef<HTMLDivElement, ShareCardTemplateProps>(
  ({ type, username, level, totalXp, achievementTitle, streak }, ref) => {
    const gradients: Record<ShareCardType, string> = {
      level_up: "linear-gradient(135deg, #1971c2 0%, #0c8599 100%)",
      achievement: "linear-gradient(135deg, #e67700 0%, #f59f00 100%)",
      streak: "linear-gradient(135deg, #c92a2a 0%, #e8590c 100%)",
    };

    const emojis: Record<ShareCardType, string> = {
      level_up: "🎉",
      achievement: "🏆",
      streak: "🔥",
    };

    const titles: Record<ShareCardType, string> = {
      level_up: `Razina ${level}!`,
      achievement: achievementTitle ?? "Novo dostignuće!",
      streak: `${streak} dana u nizu!`,
    };

    const subtitles: Record<ShareCardType, string> = {
      level_up: `${totalXp?.toLocaleString()} ukupno XP`,
      achievement: "Dostignuće otključano",
      streak: "Svakodnevna aktivnost",
    };

    return (
      <Box
        ref={ref}
        style={{
          width: 400,
          height: 400,
          background: gradients[type],
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <Stack align="center" gap="lg">
          <Text style={{ fontSize: 72, lineHeight: 1 }}>{emojis[type]}</Text>
          <Stack align="center" gap="xs">
            <Text fw={900} size="xl" c="white" ta="center">
              {titles[type]}
            </Text>
            <Text size="sm" c="rgba(255,255,255,0.8)" ta="center">
              {subtitles[type]}
            </Text>
          </Stack>
          <Group gap="xs">
            <Badge
              size="lg"
              variant="white"
              color="dark"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
            >
              @{username}
            </Badge>
            <Badge
              size="lg"
              variant="white"
              color="dark"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
            >
              Atletikum
            </Badge>
          </Group>
        </Stack>
      </Box>
    );
  },
);

ShareCardTemplate.displayName = "ShareCardTemplate";

export default ShareCardTemplate;
