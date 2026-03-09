import {
  Container,
  Grid,
  Card,
  Group,
  Text,
  Stack,
  Title,
  Center,
  Loader,
} from "@mantine/core";
import { IconTrendingUp } from "@tabler/icons-react";
import { useAchievements } from "../../../hooks/useAchievements";
import { AchievementCard } from "../../../components/Achievements/AchievementCard";

const categoryLabels: Record<string, string> = {
  milestone: "Glavne dostige",
  consistency: "Konzistencija",
  performance: "Performanse",
  special: "Posebne",
};

const ProfileAchievements = () => {
  const { data: achievements, isLoading } = useAchievements();

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    );
  }

  const all = achievements ?? [];
  const unlockedCount = all.filter((a) => a.isUnlocked).length;
  const totalXpEarned = all
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const categories = ["milestone", "consistency", "performance", "special"];
  const categorized = categories
    .map((cat) => ({
      key: cat,
      label: categoryLabels[cat] ?? cat,
      items: all.filter((a) => a.category === cat),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        <Card withBorder shadow="sm" radius="md">
          <Group justify="space-around">
            <div style={{ textAlign: "center" }}>
              <Text size="sm" c="dimmed">
                Otključane dostige
              </Text>
              <Text size="xl" fw={700} c="violet">
                {unlockedCount}/{all.length}
              </Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <Group gap={4} justify="center">
                <IconTrendingUp size={20} color="var(--mantine-color-blue-6)" />
                <Text size="sm" c="dimmed">
                  XP Zaradio/la
                </Text>
              </Group>
              <Text size="xl" fw={700} c="teal">
                {totalXpEarned}
              </Text>
            </div>
          </Group>
        </Card>

        {categorized.map((group) => (
          <Stack key={group.key} gap="md">
            <Title order={4} size="h5">
              {group.label}
            </Title>
            <Grid>
              {group.items.map((achievement) => (
                <Grid.Col
                  key={achievement._id}
                  span={{ base: 6, sm: 4, md: 3 }}
                >
                  <AchievementCard achievement={achievement} />
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        ))}
      </Stack>
    </Container>
  );
};

export default ProfileAchievements;
