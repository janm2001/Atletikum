import { Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconFlame } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { getXpProgress } from "../../utils/leveling";
import { XpProgressSection } from "../XpProgress/XpProgressSection";
import classes from "./DashboardStatsGrid.module.css";

interface DashboardStatsGridProps {
  level: number;
  totalXp: number;
  dailyStreak: number;
}

const DashboardStatsGrid = ({
  level,
  totalXp,
  dailyStreak,
}: DashboardStatsGridProps) => {
  const { t } = useTranslation();
  const { xpInLevel, xpForNext } = getXpProgress(level, totalXp);

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      p="md"
      className={classes.card}
    >
      <Stack gap="xs">
        <SimpleGrid cols={{ base: 3 }} spacing="xs">
          <Stack gap={0} align="flex-start">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("dashboard.stats.level")}
            </Text>
            <Text size="xl" fw={700}>
              {level}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {xpInLevel} / {xpForNext} XP{" "}
              {t("dashboard.stats.toLevel", { level: level + 1 })}
            </Text>
          </Stack>

          <Stack gap={0} align="center" className={classes.minWidth0}>
            <Title order={1} fw={700} className={classes.xpTitle}>
              {totalXp}
            </Title>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("dashboard.stats.totalXp")}
            </Text>
          </Stack>

          <Stack gap={0} align="flex-end">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("dashboard.stats.dailyStreak")}
            </Text>
            <Group gap={4} align="center" justify="flex-end">
              <IconFlame size={24} color="var(--mantine-color-orange-5)" />
              <Text size="xl" fw={700}>
                {dailyStreak}
              </Text>
            </Group>
          </Stack>
        </SimpleGrid>

        <XpProgressSection />
      </Stack>
    </Card>
  );
};

export default DashboardStatsGrid;
