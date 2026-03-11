import { Divider, SimpleGrid } from "@mantine/core";
import ExerciseCard from "@/components/Dashboard/ExerciseCard/ExerciseCard";
import type { Exercise } from "@/types/Exercise/exercise";

interface ArticleRelatedExercisesSectionProps {
  exercises?: Exercise[];
}

const ArticleRelatedExercisesSection = ({
  exercises,
}: ArticleRelatedExercisesSectionProps) => {
  if (!exercises || exercises.length === 0) {
    return null;
  }

  return (
    <>
      <Divider my="xl" label="Povezane vježbe" labelPosition="center" />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise._id} exercise={exercise} />
        ))}
      </SimpleGrid>
    </>
  );
};

export default ArticleRelatedExercisesSection;
