import { Badge, Group, Progress, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { Mission, MissionType } from "@/types/DailyMission/dailyMission";

interface MissionItemProps {
  mission: Mission;
}

function getMissionLabel(type: MissionType): string {
  switch (type) {
    case "log_workout":
      return "Zabilježi trening";
    case "complete_quiz":
      return "Završi kviz";
    case "read_article":
      return "Pročitaj članak";
    case "check_leaderboard":
      return "Provjeri ljestvicu";
    default:
      return type;
  }
}

const MissionItem = ({ mission }: MissionItemProps) => {
  const { type, target, progress, completed, xpReward } = mission;
  const label = getMissionLabel(type);
  const progressValue = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

  return (
    <Stack gap={6}>
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          {completed ? (
            <ThemeIcon size={22} radius="xl" color="green" variant="filled">
              <IconCheck size={14} />
            </ThemeIcon>
          ) : (
            <ThemeIcon size={22} radius="xl" color="violet" variant="light">
              <Text size="xs" fw={700}>
                {progress}/{target}
              </Text>
            </ThemeIcon>
          )}
          <Text
            size="sm"
            fw={600}
            lineClamp={1}
            style={{ minWidth: 0 }}
            td={completed ? "line-through" : undefined}
            c={completed ? "dimmed" : undefined}
          >
            {label}
          </Text>
        </Group>
        <Badge size="sm" variant="light" color="yellow" style={{ flexShrink: 0 }}>
          +{xpReward} XP
        </Badge>
      </Group>
      <Progress
        value={progressValue}
        size="xs"
        radius="xl"
        color={completed ? "green" : "violet"}
      />
    </Stack>
  );
};

export default MissionItem;
