import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateWorkoutLog } from "@/hooks/useWorkoutLogs";
import { useUser } from "@/hooks/useUser";
import type { CelebrationState } from "@/types/Celebration/celebration";
import {
  getExerciseId,
  getExerciseName,
  type Workout,
} from "@/types/Workout/workout";
import type {
  CompletedExercisePayload,
  CreateWorkoutLogResult,
} from "@/types/WorkoutLog/workoutLog";
import { persistCelebrationState } from "@/utils/flowSessionStorage";

type UseWorkoutCompletionParams = {
  workout: Workout;
};

export const buildWorkoutCelebrationState = (
  workout: Workout,
  result: CreateWorkoutLogResult,
): CelebrationState => ({
  type: "workout",
  xpGained: result.totalXpGained,
  title: workout.title,
  newAchievements: result.newAchievements,
  level: result.user?.level,
  totalXp: result.user?.totalXp,
  brainXp: result.user?.brainXp,
  bodyXp: result.user?.bodyXp,
  personalBests:
    result.personalBests?.map((exercise) => {
      const workoutExercise = workout.exercises.find(
        (candidate) => getExerciseId(candidate.exerciseId) === exercise.exerciseId,
      );

      return {
        ...exercise,
        exerciseName: getExerciseName(workoutExercise?.exerciseId ?? null),
      };
    }) ?? [],
});

export const useWorkoutCompletion = ({
  workout,
}: UseWorkoutCompletionParams) => {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const createWorkoutLogMutation = useCreateWorkoutLog();

  const completeWorkout = useCallback(
    async (completedExercises: CompletedExercisePayload[]) => {
      const result = await createWorkoutLogMutation.mutateAsync({
        workoutId: workout._id,
        completedExercises,
      });

      if (result.user) {
        updateUser(result.user);
      }

      const celebrationState = buildWorkoutCelebrationState(workout, result);
      persistCelebrationState(celebrationState);

      navigate("/slavlje", {
        replace: true,
        state: celebrationState,
      });
    },
    [createWorkoutLogMutation, navigate, updateUser, workout],
  );

  return {
    completeWorkout,
    isSubmitting: createWorkoutLogMutation.isPending,
  };
};
