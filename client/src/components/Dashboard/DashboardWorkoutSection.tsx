import { Grid } from "@mantine/core";
import { useTranslation } from "react-i18next";
import WorkoutCard from "@/components/Workouts/WorkoutCard";
import type { Workout } from "@/types/Workout/workout";
import DashboardSectionHeader from "./DashboardSectionHeader";

interface DashboardWorkoutSectionProps {
  workout: Workout | null;
  onOpenWorkouts: () => void;
}

const DashboardWorkoutSection = ({
  workout,
  onOpenWorkouts,
}: DashboardWorkoutSectionProps) => {
  const { t } = useTranslation();
  if (!workout) {
    return null;
  }

  return (
    <div>
      <DashboardSectionHeader
        title={t('dashboard.workout.title')}
        actionLabel={t('dashboard.workout.viewAll')}
        onAction={onOpenWorkouts}
      />
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
          <WorkoutCard workout={workout} />
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default DashboardWorkoutSection;
