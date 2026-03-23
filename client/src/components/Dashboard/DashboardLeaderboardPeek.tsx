import {
  Avatar,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconCrown, IconMedal, IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useUser } from "@/hooks/useUser";
import { colors, gradients } from "@/styles/colors";

const rankVisuals = [
  {
    icon: IconCrown,
    iconColor: colors.leaderboard.gold.base,
    iconBackgroundLight: colors.leaderboard.gold.bgLight,
    iconBackgroundDark: colors.leaderboard.gold.bgDark,
    iconBorderLight: colors.leaderboard.gold.borderLight,
    iconBorderDark: colors.leaderboard.gold.borderDark,
  },
  {
    icon: IconMedal,
    iconColor: colors.leaderboard.silver.base,
    iconBackgroundLight: colors.leaderboard.silver.bgLight,
    iconBackgroundDark: colors.leaderboard.silver.bgDark,
    iconBorderLight: colors.leaderboard.silver.borderLight,
    iconBorderDark: colors.leaderboard.silver.borderDark,
  },
  {
    icon: IconTrophy,
    iconColor: colors.leaderboard.bronze.base,
    iconBackgroundLight: colors.leaderboard.bronze.bgLight,
    iconBackgroundDark: colors.leaderboard.bronze.bgDark,
    iconBorderLight: colors.leaderboard.bronze.borderLight,
    iconBorderDark: colors.leaderboard.bronze.borderDark,
  },
] as const;

const fallbackRankVisual = {
  icon: IconTrophy,
  iconColor: "var(--mantine-color-stitch-5)",
  iconBackgroundLight: colors.leaderboard.fallbackRank.bgLight,
  iconBackgroundDark: colors.leaderboard.fallbackRank.bgDark,
  iconBorderLight: colors.leaderboard.fallbackRank.borderLight,
  iconBorderDark: colors.leaderboard.fallbackRank.borderDark,
} as const;

const DashboardLeaderboardPeek = () => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const mode = computedColorScheme === "dark" ? "dark" : "light";
  const stitch = theme.other.stitch[mode];
  const { data: leaderboardData } = useLeaderboard();
  const { user } = useUser();

  if (!leaderboardData?.leaderboard?.length) return null;

  const top3 = leaderboardData.leaderboard.slice(0, 3);

  return (
    <Card
      p="md"
      style={{
        background: mode === "dark" ? gradients.cardDark : undefined,
      }}
    >
      <Text size="xs" tt="uppercase" fw={700} c={stitch.textMuted} mb="sm">
        {t("dashboard.leaderboardPeek.title")}
      </Text>

      <Stack gap={8}>
        {top3.map((entry, index) => {
          const isCurrentUser = user?._id === entry._id;
          const rankVisual = rankVisuals[index] ?? fallbackRankVisual;
          const RankIcon = rankVisual.icon;

          return (
            <Group
              key={entry._id}
              gap="sm"
              justify="space-between"
              wrap="nowrap"
              style={
                isCurrentUser
                  ? {
                      backgroundColor:
                        mode === "dark"
                          ? colors.leaderboard.currentUser.bgDark
                          : colors.leaderboard.currentUser.bgLight,
                      border: `1px solid ${
                        mode === "dark"
                          ? colors.leaderboard.currentUser.borderDark
                          : colors.leaderboard.currentUser.borderLight
                      }`,
                      borderRadius: 12,
                      padding: "7px 10px",
                    }
                  : {
                      backgroundColor: stitch.surfaceInteractive,
                      border: `1px solid ${stitch.borderSubtle}`,
                      borderRadius: 12,
                      padding: "7px 10px",
                    }
              }
            >
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon
                  size={28}
                  radius="xl"
                  variant="light"
                  style={{
                    flexShrink: 0,
                    color: rankVisual.iconColor,
                    backgroundColor:
                      mode === "dark"
                        ? rankVisual.iconBackgroundDark
                        : rankVisual.iconBackgroundLight,
                    border: `1px solid ${
                      mode === "dark"
                        ? rankVisual.iconBorderDark
                        : rankVisual.iconBorderLight
                    }`,
                  }}
                >
                  <RankIcon size={16} stroke={1.9} />
                </ThemeIcon>
                <Avatar
                  src={entry.profilePicture}
                  size={34}
                  radius="xl"
                  color="initials"
                  name={entry.username}
                />
                <Text
                  size="sm"
                  fw={isCurrentUser ? 700 : 500}
                  lineClamp={1}
                  style={{ minWidth: 0 }}
                >
                  {entry.username}
                </Text>
              </Group>
              <Text
                size="sm"
                c={stitch.textMuted}
                fw={700}
                style={{
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {entry.totalXp} XP
              </Text>
            </Group>
          );
        })}
      </Stack>
    </Card>
  );
};

export default DashboardLeaderboardPeek;
