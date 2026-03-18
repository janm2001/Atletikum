import { Stack, Text, Title } from "@mantine/core";
import { IconConfetti } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface CelebrationHeaderProps {
  isQuiz: boolean;
  title?: string;
}

const CelebrationHeader = ({ isQuiz, title }: CelebrationHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Stack align="center" gap="xs">
      <IconConfetti size={56} color="var(--mantine-color-yellow-5)" />
      <Title order={1} ta="center">
        {isQuiz
          ? t("celebration.quizCompleted")
          : t("celebration.workoutCompleted")}
      </Title>
      {title && (
        <Text c="dimmed" size="lg" ta="center">
          {title}
        </Text>
      )}
    </Stack>
  );
};

export default CelebrationHeader;
