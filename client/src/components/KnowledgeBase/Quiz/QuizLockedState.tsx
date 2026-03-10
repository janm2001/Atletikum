import {
  Alert,
  Card,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Button,
} from "@mantine/core";
import { IconClock, IconLock } from "@tabler/icons-react";
import type { QuizStatus } from "@/hooks/useQuiz";
import QuizBackButton from "./QuizBackButton";

interface QuizLockedStateProps {
  quizStatus: QuizStatus;
  onBack: () => void;
}

const QuizLockedState = ({ quizStatus, onBack }: QuizLockedStateProps) => {
  const nextDate = quizStatus.nextAvailableAt
    ? new Date(quizStatus.nextAvailableAt)
    : null;
  const lastScore = quizStatus.lastCompletion;

  return (
    <Container size="sm" py="xl">
      <QuizBackButton onClick={onBack} mb="xl" />

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

          <Button variant="light" onClick={onBack} mt="md">
            Povratak na članak
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};

export default QuizLockedState;
