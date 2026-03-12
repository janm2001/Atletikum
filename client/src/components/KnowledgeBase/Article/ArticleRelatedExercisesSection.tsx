import { Divider, SimpleGrid } from "@mantine/core";
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
    <>
      <Divider my="xl" label={t('articles.relatedExercises')} labelPosition="center" />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise._id} exercise={exercise} />
        ))}
      </SimpleGrid>
    </>
  );
};

export default ArticleRelatedExercisesSection;
