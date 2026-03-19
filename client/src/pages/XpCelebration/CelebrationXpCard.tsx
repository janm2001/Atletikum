import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconBrain, IconBarbell } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface CelebrationXpCardProps {
  isQuiz: boolean;
  xpGained: number;
  score?: number;
  totalQuestions?: number;
  brainXp?: number;
  bodyXp?: number;
}

const CelebrationXpCard = ({
  isQuiz,
  xpGained,
  score,
  totalQuestions,
  brainXp,
  bodyXp,
}: CelebrationXpCardProps) => {
  const { t } = useTranslation();

  return (
    <Card withBorder radius="lg" shadow="md" p="xl" w="100%">
      <Stack align="center" gap="md">
        <Group gap="sm">
          {isQuiz ? (
            <IconBrain size={32} color="var(--mantine-color-blue-5)" />
          ) : (
            <IconBarbell size={32} color="var(--mantine-color-violet-5)" />
          )}
          <Title order={2} c={isQuiz ? "blue" : "violet"}>
            {t("common.xpGained", { count: xpGained })}
          </Title>
        </Group>

        {isQuiz && score !== undefined && totalQuestions !== undefined && (
          <Group gap="lg">
            <Stack gap={2} align="center">
              <Text size="xl" fw={700}>
                {score}/{totalQuestions}
              </Text>
              <Text size="xs" c="dimmed">
                {t("celebration.correctAnswers")}
              </Text>
            </Stack>
            <Stack gap={2} align="center">
              <Text size="xl" fw={700} c="teal">
                {Math.round((score / totalQuestions) * 100)}%
              </Text>
              <Text size="xs" c="dimmed">
                {t("celebration.successRate")}
              </Text>
            </Stack>
          </Group>
        )}

        {brainXp !== undefined && bodyXp !== undefined && (
          <Group gap="lg">
            <Badge
              size="lg"
              variant="light"
              color="blue"
              leftSection={<IconBrain size={14} />}
            >
              {t("celebration.brainXp", { xp: brainXp })}
            </Badge>
            <Badge
              size="lg"
              variant="light"
              color="violet"
              leftSection={<IconBarbell size={14} />}
            >
              {t("celebration.bodyXp", { xp: bodyXp })}
            </Badge>
          </Group>
        )}
      </Stack>
    </Card>
  );
};

export default CelebrationXpCard;
