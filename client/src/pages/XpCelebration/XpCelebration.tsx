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
import { useTranslation } from "react-i18next";
import type { CelebrationState } from "@/types/Celebration/celebration";
import { formatCompletedExerciseResult } from "@/types/WorkoutLog/workoutLog";
import {
  clearPersistedCelebrationState,
  getPersistedCelebrationState,
  persistCelebrationState,
} from "@/utils/flowSessionStorage";

const XpCelebration = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as CelebrationState | null;
  const state = routeState ?? getPersistedCelebrationState();

  const [showXp, setShowXp] = useState(false);
  const [showLevel, setShowLevel] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!routeState) {
      return;
    }

    persistCelebrationState(routeState);
  }, [routeState]);

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
          <Text c="dimmed">{t('celebration.noData')}</Text>
          <Button onClick={() => navigate("/pregled")}>{t('common.back')}</Button>
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
  const personalBests = state.personalBests ?? [];
  const backPath = isQuiz ? "/edukacija" : "/zapis-treninga";
  const handleNavigateAway = (path: string) => {
    clearPersistedCelebrationState();
    navigate(path);
  };

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="xl">
        {/* Header */}
        <Transition mounted={showXp} transition="slide-down" duration={500}>
          {(styles) => (
            <Stack align="center" gap="xs" style={styles}>
              <IconConfetti size={56} color="var(--mantine-color-yellow-5)" />
              <Title order={1} ta="center">
                {isQuiz ? t('celebration.quizCompleted') : t('celebration.workoutCompleted')}
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
                          {t('celebration.correctAnswers')}
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
                          {t('celebration.successRate')}
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
                      {t('celebration.brainXp', { xp: state.brainXp })}
                    </Badge>
                    <Badge
                      size="lg"
                      variant="light"
                      color="violet"
                      leftSection={<IconBarbell size={14} />}
                    >
                      {t('celebration.bodyXp', { xp: state.bodyXp })}
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
                  {t('celebration.levelLabel', { level })}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('celebration.xpToNextLevel', { current: xpInCurrentLevel, total: xpForNextLevel })}
                </Text>
                <Text size="lg" fw={700}>
                  {t('celebration.totalXp', { xp: totalXp })}
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
                    <Title order={3}>{t('celebration.newAchievements')}</Title>
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

        {!isQuiz && personalBests.length > 0 && (
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
                      color="var(--mantine-color-orange-5)"
                    />
                    <Title order={3}>{t('celebration.personalBests')}</Title>
                  </Group>

                  {personalBests.map((personalBest, index) => (
                    <Card
                      key={`${personalBest.exerciseId}-${index}`}
                      withBorder
                      radius="md"
                      p="md"
                      w="100%"
                      style={{
                        borderColor: "var(--mantine-color-orange-5)",
                        backgroundColor: "var(--mantine-color-orange-light)",
                      }}
                    >
                      <Group justify="space-between" align="center">
                        <div>
                          <Text fw={700}>
                            {personalBest.exerciseName ??
                              t('training.logs.unknownExercise')}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {formatCompletedExerciseResult(personalBest)} · RPE{" "}
                            {personalBest.rpe}
                          </Text>
                        </div>
                        <Badge color="orange" variant="light">
                          {t('training.logs.newPR')}
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
              <Button
                variant="light"
                onClick={() => handleNavigateAway(backPath)}
              >
                {isQuiz ? t('celebration.backToEducation') : t('celebration.backToWorkouts')}
              </Button>
              <Button
                rightSection={<IconArrowRight size={16} />}
                onClick={() => handleNavigateAway("/pregled")}
              >
                {t('celebration.backToOverview')}
              </Button>
            </Group>
          )}
        </Transition>
      </Stack>
    </Container>
  );
};

export default XpCelebration;
