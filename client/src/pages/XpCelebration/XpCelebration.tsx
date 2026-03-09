import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  RingProgress,
  Stack,
  Text,
  Title,
  Transition,
} from "@mantine/core";
import {
  IconBrain,
  IconBarbell,
  IconStar,
  IconTrophy,
  IconArrowRight,
  IconConfetti,
} from "@tabler/icons-react";
import {
  getLevelFromTotalXp,
  getXpRequiredForLevelUp,
  getTotalXpForLevelStart,
} from "../../utils/leveling";
import type { NewAchievement } from "../../types/Achievement/achievement";

type CelebrationState = {
  type: "quiz" | "workout";
  xpGained: number;
  title?: string;
  score?: number;
  totalQuestions?: number;
  newAchievements?: NewAchievement[];
  level?: number;
  totalXp?: number;
  brainXp?: number;
  bodyXp?: number;
};

const XpCelebration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CelebrationState | null;

  const [showXp, setShowXp] = useState(false);
  const [showLevel, setShowLevel] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!state) return;

    const timers = [
      setTimeout(() => setShowXp(true), 300),
      setTimeout(() => setShowLevel(true), 800),
      setTimeout(() => setShowAchievements(true), 1300),
      setTimeout(() => setShowActions(true), 1800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [state]);

  if (!state) {
    return (
      <Center style={{ height: "calc(100vh - 100px)" }}>
        <Stack align="center" gap="md">
          <Text c="dimmed">Nema podataka za prikaz.</Text>
          <Button onClick={() => navigate("/pregled")}>Povratak</Button>
        </Stack>
      </Center>
    );
  }

  const isQuiz = state.type === "quiz";
  const level = state.level ?? getLevelFromTotalXp(state.totalXp ?? 0);
  const totalXp = state.totalXp ?? 0;
  const levelStartXp = getTotalXpForLevelStart(level);
  const xpForNextLevel = getXpRequiredForLevelUp(level);
  const xpInCurrentLevel = totalXp - levelStartXp;
  const progressPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpForNextLevel) * 100),
  );

  const achievements = state.newAchievements ?? [];
  const backPath = isQuiz ? "/edukacija" : "/zapis-treninga";

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="xl">
        {/* Header */}
        <Transition mounted={showXp} transition="slide-down" duration={500}>
          {(styles) => (
            <Stack align="center" gap="xs" style={styles}>
              <IconConfetti size={56} color="var(--mantine-color-yellow-5)" />
              <Title order={1} ta="center">
                {isQuiz ? "Kviz Završen!" : "Trening Završen!"}
              </Title>
              {state.title && (
                <Text c="dimmed" size="lg" ta="center">
                  {state.title}
                </Text>
              )}
            </Stack>
          )}
        </Transition>

        {/* XP Earned */}
        <Transition mounted={showXp} transition="scale" duration={600}>
          {(styles) => (
            <Card
              withBorder
              radius="lg"
              shadow="md"
              p="xl"
              w="100%"
              style={styles}
            >
              <Stack align="center" gap="md">
                <Group gap="sm">
                  {isQuiz ? (
                    <IconBrain size={32} color="var(--mantine-color-blue-5)" />
                  ) : (
                    <IconBarbell
                      size={32}
                      color="var(--mantine-color-violet-5)"
                    />
                  )}
                  <Title order={2} c={isQuiz ? "blue" : "violet"}>
                    +{state.xpGained} XP
                  </Title>
                </Group>

                {isQuiz &&
                  state.score !== undefined &&
                  state.totalQuestions !== undefined && (
                    <Group gap="lg">
                      <Stack gap={2} align="center">
                        <Text size="xl" fw={700}>
                          {state.score}/{state.totalQuestions}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Točnih odgovora
                        </Text>
                      </Stack>
                      <Stack gap={2} align="center">
                        <Text size="xl" fw={700} c="teal">
                          {Math.round(
                            (state.score / state.totalQuestions) * 100,
                          )}
                          %
                        </Text>
                        <Text size="xs" c="dimmed">
                          Uspješnost
                        </Text>
                      </Stack>
                    </Group>
                  )}

                {state.brainXp !== undefined && state.bodyXp !== undefined && (
                  <Group gap="lg">
                    <Badge
                      size="lg"
                      variant="light"
                      color="blue"
                      leftSection={<IconBrain size={14} />}
                    >
                      Mozak: {state.brainXp} XP
                    </Badge>
                    <Badge
                      size="lg"
                      variant="light"
                      color="violet"
                      leftSection={<IconBarbell size={14} />}
                    >
                      Tijelo: {state.bodyXp} XP
                    </Badge>
                  </Group>
                )}
              </Stack>
            </Card>
          )}
        </Transition>

        {/* Level Progress */}
        <Transition mounted={showLevel} transition="scale" duration={600}>
          {(styles) => (
            <Card
              withBorder
              radius="lg"
              shadow="sm"
              p="xl"
              w="100%"
              style={styles}
            >
              <Stack align="center" gap="sm">
                <RingProgress
                  size={120}
                  thickness={10}
                  roundCaps
                  sections={[{ value: progressPercent, color: "violet" }]}
                  label={
                    <Center>
                      <Stack gap={0} align="center">
                        <IconStar
                          size={20}
                          color="var(--mantine-color-yellow-5)"
                        />
                        <Text fw={700} size="lg">
                          {level}
                        </Text>
                      </Stack>
                    </Center>
                  }
                />
                <Text size="sm" c="dimmed">
                  Razina {level}
                </Text>
                <Text size="xs" c="dimmed">
                  {xpInCurrentLevel} / {xpForNextLevel} XP do sljedeće razine
                </Text>
                <Text size="lg" fw={700}>
                  Ukupno: {totalXp} XP
                </Text>
              </Stack>
            </Card>
          )}
        </Transition>

        {/* New Achievements */}
        {achievements.length > 0 && (
          <Transition
            mounted={showAchievements}
            transition="slide-up"
            duration={500}
          >
            {(styles) => (
              <Card
                withBorder
                radius="lg"
                shadow="sm"
                p="xl"
                w="100%"
                style={styles}
              >
                <Stack align="center" gap="md">
                  <Group gap="xs">
                    <IconTrophy
                      size={24}
                      color="var(--mantine-color-yellow-5)"
                    />
                    <Title order={3}>Nova dostignuća!</Title>
                  </Group>

                  {achievements.map((ach) => (
                    <Card
                      key={ach._id}
                      withBorder
                      radius="md"
                      p="md"
                      w="100%"
                      style={{
                        borderColor: "var(--mantine-color-yellow-5)",
                        backgroundColor: "var(--mantine-color-yellow-light)",
                      }}
                    >
                      <Group justify="space-between">
                        <div>
                          <Text fw={700}>{ach.title}</Text>
                          <Text size="sm" c="dimmed">
                            {ach.description}
                          </Text>
                        </div>
                        <Badge color="yellow" variant="filled">
                          +{ach.xpReward} XP
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </Card>
            )}
          </Transition>
        )}

        {/* Actions */}
        <Transition mounted={showActions} transition="fade" duration={400}>
          {(styles) => (
            <Group gap="md" style={styles}>
              <Button variant="light" onClick={() => navigate(backPath)}>
                {isQuiz ? "Nazad na edukaciju" : "Nazad na treninge"}
              </Button>
              <Button
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate("/pregled")}
              >
                Pregled
              </Button>
            </Group>
          )}
        </Transition>
      </Stack>
    </Container>
  );
};

export default XpCelebration;
