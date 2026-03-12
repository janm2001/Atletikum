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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  if (quizQuestionCount === 0) {
    return null;
  }

  return (
    <>
      <Divider my="xl" label={t('articles.quiz.sectionTitle')} labelPosition="center" />
      <Paper p="xl" withBorder radius="md" ta="center">
        {quizStatus && !quizStatus.canTakeQuiz && quizStatus.lastCompletion ? (
          <Stack align="center" gap="md">
            <IconLock size={48} color="var(--mantine-color-gray-5)" />
            <Title order={3}>{t('articles.quiz.locked')}</Title>
            <Text c="dimmed">
              {t('articles.quiz.lockedMessage')}
            </Text>

            <Group justify="center" gap="lg" mt="xs">
              <Stack gap={2} align="center">
                <Text size="xl" fw={700}>
                  {quizStatus.lastCompletion.score}/
                  {quizStatus.lastCompletion.totalQuestions}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('articles.quiz.correctLabel')}
                </Text>
              </Stack>
              <Stack gap={2} align="center">
                <Text size="xl" fw={700} c="teal">
                  +{quizStatus.lastCompletion.xpGained}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('articles.quiz.xpEarned')}
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
                    ? t('articles.quiz.passed')
                    : t('articles.quiz.failed')}
                </Badge>
                <Text size="xs" c="dimmed">
                  {t('articles.quiz.status')}
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
                {t('articles.quiz.availableDate', { date: new Date(quizStatus.nextAvailableAt).toLocaleDateString(
                    "hr-HR",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  ) })}
              </Alert>
            )}
          </Stack>
        ) : quizStatus?.lastCompletion ? (
          <Stack align="center" gap="md">
            <IconBrain size={48} color="var(--mantine-color-blue-5)" />
            <Title order={3}>{t('articles.quiz.testKnowledge')}</Title>

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
                {t('articles.quiz.previousResultBadge', { score: quizStatus.lastCompletion.score, total: quizStatus.lastCompletion.totalQuestions })} -{" "}
                {quizStatus.lastCompletion.passed ? t('articles.quiz.passed') : t('articles.quiz.failed')}
              </Badge>
            </Group>

            <Text c="dimmed" size="sm">
              {t('articles.quiz.retryDescription')}
            </Text>

            <Badge size="lg" variant="light" color="grape">
              {t('articles.quiz.maxXp', { xp: quizQuestionCount * 25 })}
            </Badge>

            <Button size="lg" onClick={() => onStartQuiz(articleId)}>
              {t('articles.quiz.retryButton')}
            </Button>
          </Stack>
        ) : (
          <Stack align="center" gap="md">
            <IconBrain size={48} color="var(--mantine-color-blue-5)" />
            <Title order={3}>{t('articles.quiz.testKnowledge')}</Title>
            <Text c="dimmed">{t('articles.quiz.firstDescription')}</Text>
            <Badge size="lg" variant="light" color="grape">
              {t('articles.quiz.maxXp', { xp: quizQuestionCount * 25 })}
            </Badge>
            <Button size="lg" onClick={() => onStartQuiz(articleId)}>
              {t('articles.quiz.startButton')}
            </Button>
          </Stack>
        )}
      </Paper>
    </>
  );
};

export default ArticleQuizSection;
