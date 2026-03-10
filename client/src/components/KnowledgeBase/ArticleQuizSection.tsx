import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBrain,
  IconCheck,
  IconClock,
  IconLock,
  IconX,
} from "@tabler/icons-react";
import type { QuizStatus } from "@/hooks/useQuiz";

interface ArticleQuizSectionProps {
  articleId: string;
  quizQuestionCount: number;
  quizStatus?: QuizStatus;
  onStartQuiz: (articleId: string) => void;
}

const ArticleQuizSection = ({
  articleId,
  quizQuestionCount,
  quizStatus,
  onStartQuiz,
}: ArticleQuizSectionProps) => {
  if (quizQuestionCount === 0) {
    return null;
  }

  return (
    <>
      <Divider my="xl" label="Provjera znanja" labelPosition="center" />
      <Paper p="xl" withBorder radius="md" ta="center">
        {quizStatus && !quizStatus.canTakeQuiz && quizStatus.lastCompletion ? (
          <Stack align="center" gap="md">
            <IconLock size={48} color="var(--mantine-color-gray-5)" />
            <Title order={3}>Kviz je zaključan</Title>
            <Text c="dimmed">
              Već ste riješili ovaj kviz. Pokušajte ponovo nakon isteka vremena.
            </Text>

            <Group justify="center" gap="lg" mt="xs">
              <Stack gap={2} align="center">
                <Text size="xl" fw={700}>
                  {quizStatus.lastCompletion.score}/
                  {quizStatus.lastCompletion.totalQuestions}
                </Text>
                <Text size="xs" c="dimmed">
                  Točnih
                </Text>
              </Stack>
              <Stack gap={2} align="center">
                <Text size="xl" fw={700} c="teal">
                  +{quizStatus.lastCompletion.xpGained}
                </Text>
                <Text size="xs" c="dimmed">
                  XP zarađeno
                </Text>
              </Stack>
              <Stack gap={2} align="center">
                <Badge
                  size="lg"
                  color={quizStatus.lastCompletion.passed ? "green" : "red"}
                  variant="light"
                  leftSection={
                    quizStatus.lastCompletion.passed ? (
                      <IconCheck size={14} />
                    ) : (
                      <IconX size={14} />
                    )
                  }
                >
                  {quizStatus.lastCompletion.passed
                    ? "Položen"
                    : "Nije položen"}
                </Badge>
                <Text size="xs" c="dimmed">
                  Status
                </Text>
              </Stack>
            </Group>

            {quizStatus.nextAvailableAt && (
              <Alert
                icon={<IconClock size={18} />}
                color="blue"
                variant="light"
                w="100%"
                maw={400}
                mx="auto"
              >
                Kviz će biti dostupan{" "}
                <Text span fw={600}>
                  {new Date(quizStatus.nextAvailableAt).toLocaleDateString(
                    "hr-HR",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </Text>
              </Alert>
            )}
          </Stack>
        ) : quizStatus?.lastCompletion ? (
          <Stack align="center" gap="md">
            <IconBrain size={48} color="var(--mantine-color-blue-5)" />
            <Title order={3}>Testiraj svoje znanje</Title>

            <Group justify="center" gap="md">
              <Badge
                size="lg"
                color={quizStatus.lastCompletion.passed ? "green" : "red"}
                variant="light"
                leftSection={
                  quizStatus.lastCompletion.passed ? (
                    <IconCheck size={14} />
                  ) : (
                    <IconX size={14} />
                  )
                }
              >
                Prethodni rezultat: {quizStatus.lastCompletion.score}/
                {quizStatus.lastCompletion.totalQuestions} -{" "}
                {quizStatus.lastCompletion.passed ? "Položen" : "Nije položen"}
              </Badge>
            </Group>

            <Text c="dimmed" size="sm">
              Riješite kviz ponovo i poboljšajte rezultat!
            </Text>

            <Badge size="lg" variant="light" color="grape">
              Do {quizQuestionCount * 25} XP (min. 50% za prolaz)
            </Badge>

            <Button size="lg" onClick={() => onStartQuiz(articleId)}>
              Ponovi Kviz
            </Button>
          </Stack>
        ) : (
          <Stack align="center" gap="md">
            <IconBrain size={48} color="var(--mantine-color-blue-5)" />
            <Title order={3}>Testiraj svoje znanje</Title>
            <Text c="dimmed">Riješite kviz i zaradite XP bodove!</Text>
            <Badge size="lg" variant="light" color="grape">
              Do {quizQuestionCount * 25} XP (min. 50% za prolaz)
            </Badge>
            <Button size="lg" onClick={() => onStartQuiz(articleId)}>
              Započni Kviz
            </Button>
          </Stack>
        )}
      </Paper>
    </>
  );
};

export default ArticleQuizSection;
