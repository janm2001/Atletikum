import {
  Container,
  Grid,
  Card,
  Image,
  Badge,
  Group,
  Text,
  Tooltip,
  Stack,
  Title,
} from "@mantine/core";
import { IconTrendingUp } from "@tabler/icons-react";
import { MOCK_ACHIEVEMENTS } from "../../../data/mockAchievements";
import { colors } from "../../../styles/colors";

const ProfileAchievements = () => {
  const unlockedCount = MOCK_ACHIEVEMENTS.filter((a) => a.isUnlocked).length;
  const totalXpEarned = MOCK_ACHIEVEMENTS.filter((a) => a.isUnlocked).reduce(
    (sum, a) => sum + a.xpReward,
    0,
  );

  const categorizedAchievements = {
    milestone: MOCK_ACHIEVEMENTS.filter((a) => a.category === "milestone"),
    consistency: MOCK_ACHIEVEMENTS.filter((a) => a.category === "consistency"),
    performance: MOCK_ACHIEVEMENTS.filter((a) => a.category === "performance"),
    special: MOCK_ACHIEVEMENTS.filter((a) => a.category === "special"),
  };

  const categoryLabels = {
    milestone: "Glavne dostige",
    consistency: "Konzistencija",
    performance: "Performanse",
    special: "Posebne",
  };

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        {/* Stats Section */}
        <Card withBorder shadow="sm" radius="md">
          <Group justify="space-around">
            <div style={{ textAlign: "center" }}>
              <Text size="sm" c="dimmed">
                Otključane dostige
              </Text>
              <Text size="xl" fw={700} c="violet">
                {unlockedCount}/{MOCK_ACHIEVEMENTS.length}
              </Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <Group gap={4} justify="center">
                <IconTrendingUp size={20} color={colors.semantic.info} />
                <Text size="sm" c="dimmed">
                  XP Zaradio/la
                </Text>
              </Group>
              <Text size="xl" fw={700} c={colors.primary.light}>
                {totalXpEarned}
              </Text>
            </div>
          </Group>
        </Card>

        {/* Achievements by Category */}
        {Object.entries(categorizedAchievements).map(
          ([category, achievements]) => (
            <Stack key={category} gap="md">
              <Title order={4} size="h5">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </Title>
              <Grid>
                {achievements.map((achievement) => (
                  <Grid.Col
                    key={achievement.id}
                    span={{ base: 6, sm: 4, md: 3 }}
                  >
                    <Tooltip
                      label={
                        <Stack gap={4}>
                          <Text fw={600} size="sm">
                            {achievement.title}
                          </Text>
                          <Text size="xs">{achievement.description}</Text>
                          <Group gap={4}>
                            <Badge size="sm" variant="dot" color="yellow">
                              +{achievement.xpReward} XP
                            </Badge>
                          </Group>
                          {achievement.isUnlocked && achievement.unlockedAt && (
                            <Text size="xs" c="dimmed">
                              Otključano:{" "}
                              {new Date(
                                achievement.unlockedAt,
                              ).toLocaleDateString("hr-HR")}
                            </Text>
                          )}
                        </Stack>
                      }
                      withArrow
                      position="top"
                    >
                      <Card
                        padding={0}
                        radius="md"
                        style={{
                          cursor: "pointer",
                          opacity: achievement.isUnlocked ? 1 : 0.4,
                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",
                          border: achievement.isUnlocked
                            ? `2px solid ${colors.primary.light}`
                            : `2px solid ${colors.text.secondary}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow =
                            achievement.isUnlocked
                              ? `0 0 15px ${colors.primary.light}`
                              : "none";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <Card.Section>
                          <Image
                            src={achievement.badgeUrl}
                            height={120}
                            alt={achievement.title}
                          />
                        </Card.Section>

                        <Group justify="space-between" mt="xs" px="sm" pb="sm">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" fw={600} truncate>
                              {achievement.title}
                            </Text>
                            {achievement.isUnlocked ? (
                              <Badge size="xs" color="green" variant="dot">
                                Otključano
                              </Badge>
                            ) : (
                              <Badge size="xs" color="gray" variant="outline">
                                Zaključano
                              </Badge>
                            )}
                          </div>
                        </Group>
                      </Card>
                    </Tooltip>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          ),
        )}
      </Stack>
    </Container>
  );
};

export default ProfileAchievements;
