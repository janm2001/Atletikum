import {
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconStar } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import MissionItem from "./MissionItem";
import classes from "./DailyMissions.module.css";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const DailyMissionsCard = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useDailyMissions();

  if (isLoading) {
    return (
      <Card withBorder radius="md" shadow="sm" p="md">
        <Center py="md">
          <Loader size="sm" color="violet" type="dots" />
        </Center>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card withBorder radius="md" shadow="sm" p="md">
        <Center>
          <Stack align="center" gap="xs">
            <ThemeIcon color="red" variant="light" size="sm">
              <IconAlertCircle size={14} />
            </ThemeIcon>
            <Text c="red" size="sm">
              {t("dailyMissions.error")}
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  const { missions, bonusClaimed, date } = data;
  const completedCount = missions.filter((m) => m.completed).length;
  const totalCount = missions.length;
  const allDone = completedCount === totalCount && totalCount > 0;
  const bonusXp = missions.reduce((sum, m) => sum + m.xpReward, 0);

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Title order={5} tt="uppercase" fw={700} mb={2} size="xs" c="var(--app-text-muted)">
        {t("dailyMissions.title")}
      </Title>
      <Text size="xs" c="var(--app-text-muted)" mb="sm">
        {formatDate(date)}
      </Text>

      <Stack gap="sm">
        {missions.map((mission) => (
          <MissionItem key={mission._id} mission={mission} />
        ))}

        <Card withBorder radius="md" p="sm" className={classes.card}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon
                size={44}
                radius="xl"
                color={allDone && bonusClaimed ? "yellow" : "gray"}
                variant="light"
                className={classes.shrink0}
              >
                <IconStar size={22} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text fw={600} size="md" c={allDone && bonusClaimed ? "yellow" : undefined}>
                  {t("dailyMissions.bonus", { xp: bonusXp })}
                </Text>
                <Text size="sm" c="var(--app-text-muted)">
                  {t("dailyMissions.progress", { completed: completedCount, total: totalCount })}
                </Text>
              </Stack>
            </Group>
            {allDone && bonusClaimed && (
              <Badge size="sm" variant="filled" color="green" className={classes.shrink0}>
                ✓
              </Badge>
            )}
          </Group>
        </Card>
      </Stack>
    </Card>
  );
};

export default DailyMissionsCard;
