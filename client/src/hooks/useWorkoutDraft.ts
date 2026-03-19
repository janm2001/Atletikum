import { useCallback, useState } from "react";
import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";
import type { DraftSetValues, WorkoutDraft } from "@/types/Workout/workoutDraft";
import type { Workout } from "@/types/Workout/workout";
import { clearDraft, getDraft, saveDraft } from "@/utils/workoutDraftStorage";
import { createDefaultSets } from "@/hooks/useExerciseProgression";

type DraftSource = "fresh" | "restored" | "repeat";

type InitFromRepeatParams = {
  completedExercises: CompletedExercisePayload[];
  setValuesByExercise: Map<string, DraftSetValues[]>;
};

type UseWorkoutDraftParams = {
  workout: Workout;
};

const buildFreshDraft = (workout: Workout): WorkoutDraft => {
  const firstExercise = workout.exercises[0];
  const prescribedLoadKg =
    firstExercise?.progression?.prescribedLoadKg ??
    firstExercise?.progression?.initialWeightKg ??
    null;
  const setCount = Math.max(1, Number(firstExercise?.sets ?? 1));

  return {
    version: 1,
    workoutId: workout._id,
    exerciseIndex: 0,
    completedExercises: [],
    currentSetValues: createDefaultSets(setCount, prescribedLoadKg),
    idempotencyKey: crypto.randomUUID(),
    submitting: false,
    startedAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
  };
};

export const useWorkoutDraft = ({ workout }: UseWorkoutDraftParams) => {
  // Use useState lazy initializer (NOT useRef) so draft is read once and stays stable
  const [existingDraft] = useState(() => getDraft(workout._id));

  const [draftSource, setDraftSource] = useState<DraftSource | null>(
    existingDraft ? "restored" : null,
  );
  const [currentIndex, setCurrentIndex] = useState(
    existingDraft?.exerciseIndex ?? 0,
  );
  const [completedExercises, setCompletedExercises] = useState<
    CompletedExercisePayload[]
  >(existingDraft?.completedExercises ?? []);
  const [idempotencyKey] = useState(
    () => existingDraft?.idempotencyKey ?? crypto.randomUUID(),
  );
  const [submitting, setSubmitting] = useState(
    existingDraft?.submitting ?? false,
  );
  const [startedAt] = useState(
    () => existingDraft?.startedAt ?? new Date().toISOString(),
  );
  const [initialSetValues] = useState<DraftSetValues[]>(
    () => existingDraft?.currentSetValues ?? [],
  );

  const hasDraft = existingDraft !== null;
  const isSubmittingFromDraft = hasDraft && (existingDraft?.submitting ?? false);

  const persistDraft = useCallback(
    (
      exerciseIndex: number,
      completed: CompletedExercisePayload[],
      currentSets: DraftSetValues[],
      isSubmitting = false,
    ) => {
      const draft: WorkoutDraft = {
        version: 1,
        workoutId: workout._id,
        exerciseIndex,
        completedExercises: completed,
        currentSetValues: currentSets,
        idempotencyKey,
        submitting: isSubmitting,
        startedAt,
        lastSavedAt: new Date().toISOString(),
      };
      saveDraft(draft);
    },
    [workout._id, idempotencyKey, startedAt],
  );

  const startFresh = useCallback(() => {
    const fresh = buildFreshDraft(workout);
    setCurrentIndex(0);
    setCompletedExercises([]);
    setDraftSource("fresh");
    saveDraft(fresh);
  }, [workout]);

  const startFromRepeat = useCallback(
    ({ setValuesByExercise }: InitFromRepeatParams) => {
      setCurrentIndex(0);
      setCompletedExercises([]);
      setDraftSource("repeat");
      const firstExercise = workout.exercises[0];
      const firstExerciseId =
        typeof firstExercise?.exerciseId === "object"
          ? firstExercise.exerciseId._id
          : (firstExercise?.exerciseId ?? "");
      const firstSets = setValuesByExercise.get(firstExerciseId) ?? [];
      const draft: WorkoutDraft = {
        version: 1,
        workoutId: workout._id,
        exerciseIndex: 0,
        completedExercises: [],
        currentSetValues:
          firstSets.length > 0
            ? firstSets
            : createDefaultSets(
                firstExercise?.sets ?? 1,
                firstExercise?.progression?.prescribedLoadKg ?? null,
              ),
        idempotencyKey: crypto.randomUUID(),
        submitting: false,
        startedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
      };
      saveDraft(draft);
    },
    [workout],
  );

  const resumeDraft = useCallback(() => {
    setDraftSource("restored");
  }, []);

  const discardDraft = useCallback(() => {
    clearDraft(workout._id);
    setDraftSource(null);
    setCurrentIndex(0);
    setCompletedExercises([]);
  }, [workout._id]);

  const clearOnSuccess = useCallback(() => {
    clearDraft(workout._id);
  }, [workout._id]);

  const markSubmitting = useCallback((isSubmitting: boolean) => {
    setSubmitting(isSubmitting);
  }, []);

  return {
    // State
    currentIndex,
    setCurrentIndex,
    completedExercises,
    setCompletedExercises,
    idempotencyKey,
    submitting,
    startedAt,
    draftSource,
    initialSetValues,

    // Draft status
    hasDraft,
    isSubmittingFromDraft,

    // Actions
    startFresh,
    startFromRepeat,
    resumeDraft,
    discardDraft,
    persistDraft,
    clearOnSuccess,
    markSubmitting,
  };
};
