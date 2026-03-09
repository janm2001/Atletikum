import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Radio,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconLock,
  IconX,
} from "@tabler/icons-react";
import { useArticleDetail } from "../../hooks/useArticle";
import { useQuizStatus, useSubmitQuiz } from "../../hooks/useQuiz";
import { UserContext } from "../../context/UserContextCreate";
import type { QuizQuestion } from "../../types/Article/article";
import { QuizOptionCard } from "../../components/KnowledgeBase/QuizOptionCard";

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userCtx = useContext(UserContext);

  const { data: article, isLoading: articleLoading } = useArticleDetail(id!);
  const { data: quizStatus, isLoading: statusLoading } = useQuizStatus(id!);
  const submitQuizMutation = useSubmitQuiz();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  if (articleLoading || statusLoading) {
    return (
      <Center style={{ height: "calc(100vh - 100px)" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (!article || !article.quiz || article.quiz.length === 0) {
    return (
      <Center
        style={{ height: "calc(100vh - 100px)", flexDirection: "column" }}
      >
        <Title order={2}>Kviz nije dostupan</Title>
        <Button mt="md" onClick={() => navigate(`/edukacija/${id}`)}>
          Povratak na članak
        </Button>
      </Center>
    );
  }

  const questions: QuizQuestion[] = article.quiz;

  // --- Cooldown lock ---
  if (quizStatus && !quizStatus.canTakeQuiz) {
    const nextDate = quizStatus.nextAvailableAt
      ? new Date(quizStatus.nextAvailableAt)
      : null;
    const lastScore = quizStatus.lastCompletion;

    return (
      <Container size="sm" py="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(`/edukacija/${id}`)}
          mb="xl"
        >
          Nazad na članak
        </Button>

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

            <Button
              variant="light"
              onClick={() => navigate(`/edukacija/${id}`)}
              mt="md"
            >
              Povratak na članak
            </Button>
          </Stack>
        </Card>
      </Container>
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

  // --- Next question / finish ---
  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleQuizComplete(score);
    }
  };

  const handleQuizComplete = async (finalScore: number) => {
    try {
      const result = await submitQuizMutation.mutateAsync({
        articleId: id!,
        score: finalScore,
        totalQuestions: questions.length,
      });

      const xp = result.data.completion.xpGained;

      // Update user context with new XP/level
      if (result.data.user && userCtx) {
        userCtx.updateUser(result.data.user);
      }

      // Navigate to celebration page
      navigate("/slavlje", {
        replace: true,
        state: {
          type: "quiz",
          xpGained: xp,
          score: finalScore,
          totalQuestions: questions.length,
          title: article.title,
          newAchievements: result.data.newAchievements ?? [],
          level: result.data.user?.level,
          totalXp: result.data.user?.totalXp,
          brainXp: result.data.user?.brainXp,
          bodyXp: result.data.user?.bodyXp,
        },
      });
    } catch {
      // Still navigate back even if submission fails
      navigate(`/edukacija/${id}`, {
        replace: true,
        state: {
          quizResult: {
            xpGained: finalScore * 25,
            score: finalScore,
            totalQuestions: questions.length,
          },
        },
      });
    }
  };

  // --- Question display ---
  const currentQuestion = questions[currentQuestionIdx];
  const correctOption = currentQuestion.options[currentQuestion.correctIndex];
  const wasCorrect = selectedOption === correctOption;

  return (
    <Container size="sm" py="xl">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate(`/edukacija/${id}`)}
        mb="md"
      >
        Nazad na članak
      </Button>

      <Title order={2} mb="xs">
        {article.title}
      </Title>
      <Text c="dimmed" mb="xl">
        Provjera znanja
      </Text>

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
            {currentQuestion.options.map((option, idx) => (
              <QuizOptionCard
                key={idx}
                option={option}
                index={idx}
                correctIndex={currentQuestion.correctIndex}
                isAnswered={isAnswered}
                isSelected={option === selectedOption}
                onSelect={setSelectedOption}
              />
            ))}
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
            <Button
              onClick={handleNextQuestion}
              loading={submitQuizMutation.isPending}
            >
              {currentQuestionIdx === questions.length - 1
                ? "Završi Kviz"
                : "Sljedeće pitanje"}
            </Button>
          )}
        </Group>
      </Card>
    </Container>
  );
};

export default QuizPage;
