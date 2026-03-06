import { useContext, useState } from "react";
import {
  Card,
  Text,
  Title,
  Radio,
  Button,
  Stack,
  Badge,
  Group,
  Alert,
  Paper,
  RingProgress,
  Transition,
  Center,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconTrophy,
  IconFlame,
  IconClock,
  IconLock,
} from "@tabler/icons-react";
import type { QuizQuestion } from "../../types/Article/article";
import { useQuizStatus, useSubmitQuiz } from "../../hooks/useQuiz";
import { UserContext } from "../../context/UserContextCreate";

interface QuizProps {
  questions: QuizQuestion[];
  articleId: string;
}

export const Quiz = ({ questions, articleId }: QuizProps) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showXpReward, setShowXpReward] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const userCtx = useContext(UserContext);
  const { data: quizStatus, isLoading: statusLoading } =
    useQuizStatus(articleId);
  const submitQuizMutation = useSubmitQuiz();

  if (!questions || questions.length === 0) return null;

  // --- Cooldown check ---
  if (statusLoading) {
    return (
      <Card withBorder padding="xl" radius="md">
        <Text ta="center" c="dimmed">
          Učitavanje statusa kviza...
        </Text>
      </Card>
    );
  }

  if (quizStatus && !quizStatus.canTakeQuiz && !isFinished) {
    const nextDate = quizStatus.nextAvailableAt
      ? new Date(quizStatus.nextAvailableAt)
      : null;
    const lastScore = quizStatus.lastCompletion;

    return (
      <Card withBorder padding="xl" radius="md">
        <Stack align="center" gap="md">
          <IconLock size={48} color="var(--mantine-color-gray-5)" />
          <Title order={3}>Kviz je zaključan</Title>
          <Text c="dimmed" ta="center">
            Već ste riješili ovaj kviz. Pročitajte članak ponovo i pokušajte
            ponovno za bolji rezultat!
          </Text>

          {lastScore && (
            <Paper
              p="md"
              withBorder
              radius="md"
              w="100%"
              style={{ maxWidth: 300 }}
            >
              <Text fw={600} ta="center" mb="xs">
                Prethodni rezultat
              </Text>
              <Group justify="center" gap="lg">
                <Stack gap={2} align="center">
                  <Text size="xl" fw={700}>
                    {lastScore.score}/{lastScore.totalQuestions}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Točnih
                  </Text>
                </Stack>
                <Stack gap={2} align="center">
                  <Text size="xl" fw={700} c="teal">
                    +{lastScore.xpGained}
                  </Text>
                  <Text size="xs" c="dimmed">
                    XP zarađeno
                  </Text>
                </Stack>
              </Group>
            </Paper>
          )}

          {nextDate && (
            <Alert
              icon={<IconClock size={18} />}
              color="blue"
              variant="light"
              w="100%"
              style={{ maxWidth: 400 }}
            >
              Kviz će biti dostupan{" "}
              <Text span fw={600}>
                {nextDate.toLocaleDateString("hr-HR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </Alert>
          )}
        </Stack>
      </Card>
    );
  }

  // --- Answer submit ---
  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;

    const currentQuestion = questions[currentQuestionIdx];
    const correctOption = currentQuestion.options[currentQuestion.correctIndex];

    if (selectedOption === correctOption) {
      setScore((prev) => prev + 1);
    }

    setIsAnswered(true);
  };

  // --- Next question ---
  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz is done — score is already updated by handleAnswerSubmit above
      handleQuizComplete(score);
    }
  };

  const handleQuizComplete = async (finalScore: number) => {
    setIsFinished(true);

    try {
      const result = await submitQuizMutation.mutateAsync({
        articleId,
        score: finalScore,
        totalQuestions: questions.length,
      });

      const xp = result.data.completion.xpGained;
      setEarnedXp(xp);

      // Update user context with new XP/level
      if (result.data.user && userCtx) {
        userCtx.updateUser(result.data.user);
      }

      // Trigger XP celebration animation
      setTimeout(() => setShowXpReward(true), 300);
    } catch {
      // Still show results even if submission fails
      setEarnedXp(finalScore * 25);
      setTimeout(() => setShowXpReward(true), 300);
    }
  };

  // --- Results screen ---
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const ringColor =
      percentage >= 70 ? "green" : percentage >= 40 ? "yellow" : "red";

    return (
      <Card withBorder padding="xl" radius="md">
        <Stack align="center" gap="lg">
          <IconTrophy size={48} color={`var(--mantine-color-${ringColor}-6)`} />
          <Title order={3}>Kviz Završen!</Title>

          <RingProgress
            size={140}
            thickness={12}
            roundCaps
            sections={[{ value: percentage, color: ringColor }]}
            label={
              <Center>
                <Text size="xl" fw={700}>
                  {percentage}%
                </Text>
              </Center>
            }
          />

          <Text size="lg" fw={600}>
            {score} / {questions.length} točnih odgovora
          </Text>

          {percentage >= 70 && (
            <Text c="green" ta="center">
              Odlično! Pokazali ste izvrsno razumijevanje gradiva!
            </Text>
          )}
          {percentage >= 40 && percentage < 70 && (
            <Text c="yellow" ta="center">
              Dobar početak! Pročitajte članak ponovo za još bolje rezultate.
            </Text>
          )}
          {percentage < 40 && (
            <Text c="red" ta="center">
              Pročitajte članak pažljivije i pokušajte ponovo za 3 dana!
            </Text>
          )}

          <Transition
            mounted={showXpReward}
            transition="slide-up"
            duration={600}
            timingFunction="ease"
          >
            {(styles) => (
              <Paper
                style={styles}
                p="lg"
                withBorder
                radius="md"
                w="100%"
                bg="dark.6"
              >
                <Stack align="center" gap="sm">
                  <Group gap="xs">
                    <IconFlame
                      size={24}
                      color="var(--mantine-color-orange-5)"
                    />
                    <Text size="xl" fw={700} c="teal">
                      +{earnedXp} XP
                    </Text>
                    <IconFlame
                      size={24}
                      color="var(--mantine-color-orange-5)"
                    />
                  </Group>
                  <Text size="sm" c="dimmed">
                    Zarađeno za rješavanje kviza
                  </Text>
                  {userCtx?.user && (
                    <Badge size="lg" variant="light" color="blue">
                      Razina {userCtx.user.level} • Ukupno{" "}
                      {userCtx.user.totalXp} XP
                    </Badge>
                  )}
                </Stack>
              </Paper>
            )}
          </Transition>
        </Stack>
      </Card>
    );
  }

  // --- Question display ---
  const currentQuestion = questions[currentQuestionIdx];
  const correctOption = currentQuestion.options[currentQuestion.correctIndex];
  const wasCorrect = selectedOption === correctOption;

  return (
    <Card withBorder padding="xl" radius="md">
      <Group justify="space-between" mb="md">
        <Badge variant="outline">
          Pitanje {currentQuestionIdx + 1} / {questions.length}
        </Badge>
        <Badge color="blue">Kviz Znanja</Badge>
      </Group>

      <Title order={4} mb="xl">
        {currentQuestion.question}
      </Title>

      <Radio.Group
        value={selectedOption || ""}
        onChange={(val) => !isAnswered && setSelectedOption(val)}
        name="quiz-options"
      >
        <Stack gap="sm">
          {currentQuestion.options.map((option, idx) => {
            let color = undefined;
            if (isAnswered) {
              if (idx === currentQuestion.correctIndex) {
                color = "green.6";
              } else if (
                option === selectedOption &&
                idx !== currentQuestion.correctIndex
              ) {
                color = "red.6";
              }
            }

            return (
              <Card
                key={idx}
                p="sm"
                withBorder
                style={{
                  cursor: isAnswered ? "default" : "pointer",
                  borderColor: color
                    ? `var(--mantine-color-${color})`
                    : undefined,
                  backgroundColor: color
                    ? `var(--mantine-color-${color.replace(".6", ".1")})`
                    : undefined,
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onClick={() => !isAnswered && setSelectedOption(option)}
              >
                <Group wrap="nowrap">
                  <Radio
                    value={option}
                    label={option}
                    disabled={isAnswered}
                    color={color ? color.split(".")[0] : undefined}
                    styles={{
                      label: {
                        color: color
                          ? `var(--mantine-color-${color})`
                          : undefined,
                        fontWeight: color ? 600 : undefined,
                      },
                    }}
                  />
                  {isAnswered && idx === currentQuestion.correctIndex && (
                    <IconCheck
                      color="var(--mantine-color-green-6)"
                      size={20}
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                  {isAnswered &&
                    option === selectedOption &&
                    idx !== currentQuestion.correctIndex && (
                      <IconX
                        color="var(--mantine-color-red-6)"
                        size={20}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                </Group>
              </Card>
            );
          })}
        </Stack>
      </Radio.Group>

      {/* Feedback after answering */}
      {isAnswered && (
        <Alert
          mt="md"
          variant="light"
          color={wasCorrect ? "green" : "red"}
          icon={wasCorrect ? <IconCheck size={18} /> : <IconX size={18} />}
        >
          {wasCorrect ? (
            <Text fw={500}>Točno! Odličan odgovor.</Text>
          ) : (
            <Text fw={500}>
              Netočno. Točan odgovor je:{" "}
              <Text span fw={700} c="green">
                {correctOption}
              </Text>
            </Text>
          )}
        </Alert>
      )}

      <Group justify="flex-end" mt="xl">
        {!isAnswered ? (
          <Button
            onClick={handleAnswerSubmit}
            disabled={selectedOption === null}
          >
            Potvrdi odgovor
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIdx === questions.length - 1
              ? "Završi Kviz"
              : "Sljedeće pitanje"}
          </Button>
        )}
      </Group>
    </Card>
  );
};
