import { Card, Center, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAlertCircle, IconStar } from "@tabler/icons-react";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import MissionItem from "./MissionItem";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const DailyMissionsCard = () => {
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
              Greška pri učitavanju zadataka.
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
      <Stack gap="md">
        <Stack gap={2}>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            Dnevni zadaci
          </Text>
          <Text size="xs" c="dimmed">
            {formatDate(date)}
          </Text>
        </Stack>

        <Stack gap="sm">
          {missions.map((mission) => (
            <MissionItem key={mission._id} mission={mission} />
          ))}
        </Stack>

        <Stack gap={4}>
          <Text
            size="sm"
            fw={600}
            c={allDone && bonusClaimed ? "yellow" : "dimmed"}
          >
            <IconStar
              size={14}
              style={{ verticalAlign: "middle", marginRight: 4 }}
              color={allDone && bonusClaimed ? "var(--mantine-color-yellow-5)" : undefined}
            />
            Bonus: +{bonusXp} XP za sve zadatke!
          </Text>
          <Text size="xs" c="dimmed">
            {completedCount}/{totalCount} završeno
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
};

export default DailyMissionsCard;
