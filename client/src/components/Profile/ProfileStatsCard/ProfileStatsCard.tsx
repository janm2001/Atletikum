import { Card, Group, Stack, Text } from "@mantine/core";
import { IconFlame } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { getXpProgress } from "@/utils/leveling";
import { XpProgressSection } from "@/components/XpProgress/XpProgressSection";
import type { User } from "@/types/User/user";
import classes from "./ProfileStatsCard.module.css";

interface ProfileStatsCardProps {
  user: User;
}

const ProfileStatsCard = ({ user }: ProfileStatsCardProps) => {
  const { t } = useTranslation();
  const { xpInLevel, xpForNext } = getXpProgress(user.level, user.totalXp);

  return (
    <Card withBorder radius="md" shadow="sm" p="md" className={classes.card}>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={0} align="flex-start">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("dashboard.stats.level")}
            </Text>
            <Text size="xl" fw={700}>
              {user.level}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {xpInLevel} / {xpForNext} XP{" "}
              {t("dashboard.stats.toLevel", { level: user.level + 1 })}
            </Text>
          </Stack>

          <Stack gap={0} align="center" className={classes.minWidth0}>
            <Text fw={700} className={classes.xpTitle}>
              {user.totalXp}
            </Text>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("dashboard.stats.totalXp")}
            </Text>
          </Stack>

          <Stack gap={0} align="flex-end">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("dashboard.stats.dailyStreak")}
            </Text>
            <Group gap={4} align="center">
              <IconFlame size={24} color="var(--mantine-color-orange-5)" />
              <Text size="xl" fw={700}>
                {user.dailyStreak}
              </Text>
            </Group>
          </Stack>
        </Group>

        <XpProgressSection variant="full" />
      </Stack>
    </Card>
  );
};

export default ProfileStatsCard;
