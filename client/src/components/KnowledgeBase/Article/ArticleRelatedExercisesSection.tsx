import { SimpleGrid, Stack, Text } from "@mantine/core";
import ExerciseCard from "@/components/Dashboard/ExerciseCard/ExerciseCard";
import type { Exercise } from "@/types/Exercise/exercise";
import { useTranslation } from "react-i18next";

interface ArticleRelatedExercisesSectionProps {
  exercises?: Exercise[];
}

const ArticleRelatedExercisesSection = ({
  exercises,
}: ArticleRelatedExercisesSectionProps) => {
  const { t } = useTranslation();

  if (!exercises || exercises.length === 0) {
    return null;
  }

  return (
    <Stack gap="md" mt="xl">
      <Text size="xs" tt="uppercase" fw={700} c="var(--app-text-muted)" mb="sm">
        {t('articles.relatedExercises')}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise._id} exercise={exercise} />
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default ArticleRelatedExercisesSection;
