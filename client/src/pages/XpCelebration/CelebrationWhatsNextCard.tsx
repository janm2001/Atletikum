import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconBolt, IconBrain, IconBarbell } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface CelebrationWhatsNextCardProps {
  isQuiz: boolean;
  xpRemaining: number;
  nextLevel: number;
  onNavigate: (path: string) => void;
}

const CelebrationWhatsNextCard = ({
  isQuiz,
  xpRemaining,
  nextLevel,
  onNavigate,
}: CelebrationWhatsNextCardProps) => {
  const { t } = useTranslation();

  return (
    <Card withBorder radius="lg" shadow="sm" p="xl" w="100%">
      <Stack align="center" gap="md">
        <Group gap="xs">
          <IconBolt size={24} color="var(--mantine-color-yellow-5)" />
          <Title order={3}>{t("celebration.whatNext")}</Title>
        </Group>

        <Text size="sm" c="dimmed" ta="center">
          {t("celebration.xpToLevel", {
            xp: xpRemaining,
            level: nextLevel,
          })}
        </Text>

        <Group gap="sm">
          {isQuiz ? (
            <Button
              leftSection={<IconBarbell size={16} />}
              variant="gradient"
              gradient={{ from: "violet", to: "grape", deg: 135 }}
              onClick={() => onNavigate("/zapis-treninga")}
            >
              {t("celebration.doWorkout")}
            </Button>
          ) : (
            <Button
              leftSection={<IconBrain size={16} />}
              variant="gradient"
              gradient={{ from: "blue", to: "violet", deg: 135 }}
              onClick={() => onNavigate("/edukacija")}
            >
              {t("celebration.doQuiz")}
            </Button>
          )}
        </Group>

        <Text size="xs" c="dimmed">
          {isQuiz
            ? t("celebration.workoutSuggestion")
            : t("celebration.quizSuggestion")}
        </Text>
      </Stack>
    </Card>
  );
};

export default CelebrationWhatsNextCard;
