import axios from "axios";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  idempotencyKey?: string;
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
  idempotencyKey,
}: UseWorkoutCompletionParams) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateUser } = useUser();
  const createWorkoutLogMutation = useCreateWorkoutLog();

  const completeWorkout = useCallback(
    async (completedExercises: CompletedExercisePayload[]) => {
      try {
        const result = await createWorkoutLogMutation.mutateAsync({
          payload: { workoutId: workout._id, completedExercises },
          idempotencyKey,
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
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 409) {
            navigate("/slavlje", { replace: true });
            return;
          }

          if (status === 400) {
            throw new Error(t("workout.errors.validationFailed"));
          }

          if (typeof status === "number" && status >= 500) {
            throw new Error(t("workout.errors.serverError"));
          }

          if (!error.response) {
            throw new Error(t("workout.errors.networkError"));
          }
        }

        if (error instanceof Error) {
          throw error;
        }

        throw new Error(t("workout.errors.serverError"));
      }
    },
    [createWorkoutLogMutation, idempotencyKey, navigate, t, updateUser, workout],
  );

  return {
    completeWorkout,
    isSubmitting: createWorkoutLogMutation.isPending,
  };
};
