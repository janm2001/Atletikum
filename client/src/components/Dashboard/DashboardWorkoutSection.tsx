import { Grid } from "@mantine/core";
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
  if (!workout) {
    return null;
  }

  return (
    <div>
      <DashboardSectionHeader
        title="Predloženi trening"
        actionLabel="Svi treninzi"
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
