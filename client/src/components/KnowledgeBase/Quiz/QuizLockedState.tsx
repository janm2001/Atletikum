import {
  Alert,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Button,
} from "@mantine/core";
import { IconClock, IconLock } from "@tabler/icons-react";
import type { QuizStatus } from "@/hooks/useQuiz";
import QuizBackButton from "./QuizBackButton";
import { useTranslation } from "react-i18next";
import classes from "./QuizLockedState.module.css";

interface QuizLockedStateProps {
  quizStatus: QuizStatus;
  onBack: () => void;
}

const QuizLockedState = ({ quizStatus, onBack }: QuizLockedStateProps) => {
  const { t } = useTranslation();
  const nextDate = quizStatus.nextAvailableAt
    ? new Date(quizStatus.nextAvailableAt)
    : null;
  const lastScore = quizStatus.lastCompletion;

  return (
    <Container size="sm" py={{ base: "sm", md: "md" }}>
      <QuizBackButton onClick={onBack} mb="xl" />

      <Card withBorder padding="xl" radius="md" shadow="sm" className={classes.card}>
        <Stack align="center" gap="md">
          <IconLock size={48} className={classes.iconLock} />
          <Title order={3}>{t('articles.quiz.locked')}</Title>
          <Text c="var(--app-text-muted)" ta="center">
            {t('articles.quiz.lockedDetailMessage')}
          </Text>

          {lastScore && (
            <Card
              p="md"
              withBorder
              radius="md"
              shadow="sm"
              w="100%"
              className={classes.scorePaper}
            >
              <Text fw={600} ta="center" mb="xs">
                {t('articles.quiz.previousResult')}
              </Text>
              <Group justify="center" gap="lg">
                <Stack gap={2} align="center">
                  <Text size="xl" fw={700}>
                    {lastScore.score}/{lastScore.totalQuestions}
                  </Text>
                  <Text size="xs" c="var(--app-text-muted)">
                    {t('articles.quiz.correctLabel')}
                  </Text>
                </Stack>
                <Stack gap={2} align="center">
                  <Text size="xl" fw={700} className={classes.textTeal}>
                    +{lastScore.xpGained}
                  </Text>
                  <Text size="xs" c="var(--app-text-muted)">
                    {t('articles.quiz.xpEarned')}
                  </Text>
                </Stack>
              </Group>
            </Card>
          )}

          {nextDate && (
            <Alert
              icon={<IconClock size={18} />}
              color="violet"
              variant="light"
              w="100%"
              className={classes.alertCard}
            >
              {t('articles.quiz.availableDate', { date: nextDate.toLocaleDateString("hr-HR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }) })}
            </Alert>
          )}

          <Button variant="light" color="violet" onClick={onBack} mt="md">
            {t('articles.quiz.backToArticle')}
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};

export default QuizLockedState;
