import { Badge, Card, Group, Progress, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconBarbell,
  IconBook,
  IconBrain,
  IconCheck,
  IconTrophy,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { Mission, MissionType } from "@/types/DailyMission/dailyMission";
import classes from "./DailyMissions.module.css";

interface MissionItemProps {
  mission: Mission;
}

const MISSION_CONFIG: Record<MissionType, { icon: React.ElementType; color: string }> = {
  log_workout: { icon: IconBarbell, color: "violet" },
  complete_quiz: { icon: IconBrain, color: "blue" },
  read_article: { icon: IconBook, color: "teal" },
  check_leaderboard: { icon: IconTrophy, color: "orange" },
};

const MissionItem = ({ mission }: MissionItemProps) => {
  const { t } = useTranslation();
  const { type, target, progress, completed, xpReward } = mission;
  const config = MISSION_CONFIG[type];
  const Icon = config.icon;
  const progressValue = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

  return (
    <Card withBorder radius="md" p="sm" className={classes.card}>
      <Stack gap={6}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              size={44}
              radius="xl"
              color={completed ? "green" : config.color}
              variant="light"
              className={classes.shrink0}
            >
              {completed ? <IconCheck size={22} /> : <Icon size={22} />}
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={600} size="md">
                {t(`dailyMissions.missions.${type}`)}
              </Text>
              <Text size="sm" c="var(--app-text-muted)">
                {t("dailyMissions.progress", { completed: progress, total: target })}
              </Text>
            </Stack>
          </Group>
          <Badge
            size="sm"
            variant="light"
            color="yellow"
            className={classes.shrink0}
          >
            +{xpReward} XP
          </Badge>
        </Group>

        <Progress
          value={progressValue}
          color={completed ? "green" : config.color}
          radius="xl"
          size="md"
          ml={56}
        />
      </Stack>
    </Card>
  );
};

export default MissionItem;
