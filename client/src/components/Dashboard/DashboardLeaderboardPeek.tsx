import {
  Avatar,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  useComputedColorScheme,
} from "@mantine/core";
import { IconCrown, IconMedal, IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useUser } from "@/hooks/useUser";
import { colors } from "@/styles/colors";
import classes from "./DashboardLeaderboardPeek.module.css";

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
  const computedColorScheme = useComputedColorScheme("dark");
  const isDark = computedColorScheme === "dark";
  const { data: leaderboardData } = useLeaderboard();
  const { user } = useUser();

  if (!leaderboardData?.leaderboard?.length) return null;

  const top3 = leaderboardData.leaderboard.slice(0, 3);

  return (
    <Card p="md" className={classes.card}>
      <Text size="xs" tt="uppercase" fw={700} c="var(--app-text-muted)" mb="sm">
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
              className={`${classes.row}${isCurrentUser ? ` ${classes.rowCurrentUser}` : ""}`}
            >
              <Group gap="sm" wrap="nowrap" className={classes.minWidth0}>
                <ThemeIcon
                  size={28}
                  radius="xl"
                  variant="light"
                  style={
                    {
                      "--rank-icon-color": rankVisual.iconColor,
                      "--rank-icon-bg": isDark
                        ? rankVisual.iconBackgroundDark
                        : rankVisual.iconBackgroundLight,
                      "--rank-icon-border": isDark
                        ? rankVisual.iconBorderDark
                        : rankVisual.iconBorderLight,
                    } as React.CSSProperties
                  }
                  className={classes.rankIcon}
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
                  className={classes.minWidth0}
                >
                  {entry.username}
                </Text>
              </Group>
              <Text
                size="sm"
                c="var(--app-text-muted)"
                fw={700}
                className={classes.xpText}
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
