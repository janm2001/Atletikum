import { Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { IconFlame, IconStars, IconTrophy } from "@tabler/icons-react";

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
  return (
    <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
      <Card withBorder radius="md" shadow="sm" p="md">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" color="violet" variant="light">
            <IconTrophy size={20} />
          </ThemeIcon>
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Razina
            </Text>
            <Text size="xl" fw={700}>
              {level}
            </Text>
          </div>
        </Group>
      </Card>

      <Card withBorder radius="md" shadow="sm" p="md">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" color="blue" variant="light">
            <IconStars size={20} />
          </ThemeIcon>
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Ukupni XP
            </Text>
            <Text size="xl" fw={700}>
              {totalXp}
            </Text>
          </div>
        </Group>
      </Card>

      <Card withBorder radius="md" shadow="sm" p="md">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" color="orange" variant="light">
            <IconFlame size={20} />
          </ThemeIcon>
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Dnevni niz
            </Text>
            <Text size="xl" fw={700}>
              {dailyStreak}
            </Text>
          </div>
        </Group>
      </Card>
    </SimpleGrid>
  );
};

export default DashboardStatsGrid;
