import { useEffect, useMemo, useState } from "react";
import {
    useFieldArray,
    useForm,
    useWatch,
    type SubmitHandler,
} from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCreateWorkoutLog } from "@/hooks/useWorkoutLogs";
import { useUser } from "@/hooks/useUser";
import type {
    TrackWorkoutFormValues,
    TrackWorkoutMetric,
} from "@/types/Workout/trackWorkout";
import { getExerciseId, type Workout } from "@/types/Workout/workout";
import type {
    CompletedExercisePayload,
    WorkoutMetricType,
} from "@/types/WorkoutLog/workoutLog";

type UseTrackWorkoutFlowParams = {
    workout: Workout;
};

type CompletedExercise = {
    exerciseId: string;
    metricType: WorkoutMetricType;
    unitLabel: string;
    resultValue: number;
    loadKg?: number | null;
    rpe: number;
};

const createDefaultSets = (setCount: number): TrackWorkoutFormValues["sets"] =>
    Array.from({ length: Math.max(1, setCount) }, () => ({
        loadKg: null,
        resultValue: 0,
        rpe: 6,
    }));

export const getMetricFromPrescription = (
    prescription: string,
): TrackWorkoutMetric => {
    const normalized = prescription.trim().toLowerCase();

    if (/^(?:\d+(?:[.,]\d+)?)\s*(m|meter|metara|metar)$/.test(normalized)) {
        return {
            metricType: "distance",
            unitLabel: "m",
            label: "Udaljenost (m)",
        };
    }

    if (
        /^(?:\d+(?:[.,]\d+)?)\s*(s|sec|sek|sekundi|min|minute)$/.test(normalized)
    ) {
        return {
            metricType: "time",
            unitLabel: normalized.includes("min") ? "min" : "s",
            label: normalized.includes("min") ? "Trajanje (min)" : "Trajanje (s)",
        };
    }

    return {
        metricType: "reps",
        unitLabel: "reps",
        label: "Ponavljanja",
    };
};

export const useTrackWorkoutFlow = ({ workout }: UseTrackWorkoutFlowParams) => {
    const navigate = useNavigate();
    const { updateUser } = useUser();
    const createWorkoutLogMutation = useCreateWorkoutLog();

    const {
        control,
        handleSubmit,
        reset,
        trigger,
        formState: { errors },
    } = useForm<TrackWorkoutFormValues>({
        defaultValues: {
            sets: createDefaultSets(workout.exercises[0]?.sets ?? 1),
        },
    });

    const { fields: setFields } = useFieldArray({
        control,
        name: "sets",
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedExercises, setCompletedExercises] = useState<
        CompletedExercise[]
    >([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
        null,
    );
    const [activeSetIndex, setActiveSetIndex] = useState(0);
    const [readinessScore, setReadinessScore] = useState("3");
    const [sessionFeedbackScore, setSessionFeedbackScore] = useState("3");

    const currentExercise = workout.exercises[currentIndex];
    const currentMetric = useMemo(
        () => getMetricFromPrescription(currentExercise?.reps ?? ""),
        [currentExercise?.reps],
    );
    const plannedSetCount = Math.max(1, Number(currentExercise?.sets ?? 1));
    const watchedSets = useWatch({ control, name: "sets" });

    const totalExercises = workout.exercises.length;
    const completedExerciseCount = currentIndex;
    const progressValue =
        totalExercises > 0 ? (completedExerciseCount / totalExercises) * 100 : 0;

    useEffect(() => {
        reset({
            sets: createDefaultSets(plannedSetCount),
        });
    }, [currentExercise?.exerciseId, plannedSetCount, reset]);

    const handleNextSet = async () => {
        const isCurrentSetValid = await trigger([
            `sets.${activeSetIndex}.loadKg`,
            `sets.${activeSetIndex}.resultValue`,
            `sets.${activeSetIndex}.rpe`,
        ]);

        if (!isCurrentSetValid) {
            return;
        }

        setActiveSetIndex((previous) =>
            Math.min(previous + 1, plannedSetCount - 1),
        );
    };

    const handlePreviousSet = () => {
        setActiveSetIndex((previous) => Math.max(previous - 1, 0));
    };

    const submitCurrentExercise: SubmitHandler<TrackWorkoutFormValues> = async (
        values,
    ) => {
        if (!currentExercise) {
            return;
        }

        const trackedExerciseSets: CompletedExercise[] = values.sets.map(
            (setItem) => ({
                exerciseId: getExerciseId(currentExercise.exerciseId),
                metricType: currentMetric.metricType,
                unitLabel: currentMetric.unitLabel,
                resultValue: Number(setItem.resultValue ?? 0),
                loadKg:
                    setItem.loadKg === null || setItem.loadKg === undefined
                        ? null
                        : Number(setItem.loadKg),
                rpe: Number(setItem.rpe ?? 0),
            }),
        );

        const updatedCompletedExercises = [
            ...completedExercises,
            ...trackedExerciseSets,
        ];
        const isLastExercise = currentIndex >= workout.exercises.length - 1;

        if (isLastExercise) {
            const result = await createWorkoutLogMutation.mutateAsync({
                workoutId: workout._id,
                completedExercises:
                    updatedCompletedExercises as CompletedExercisePayload[],
                readinessScore: Number(readinessScore),
                sessionFeedbackScore: Number(sessionFeedbackScore),
            });

            if (result.user) {
                updateUser(result.user);
            }

            navigate("/slavlje", {
                replace: true,
                state: {
                    type: "workout",
                    xpGained: result.totalXpGained,
                    title: workout.title,
                    newAchievements: result.newAchievements,
                    level: result.user?.level,
                    totalXp: result.user?.totalXp,
                    brainXp: result.user?.brainXp,
                    bodyXp: result.user?.bodyXp,
                },
            });
            return;
        }

        setCompletedExercises(updatedCompletedExercises);
        setActiveSetIndex(0);
        setCurrentIndex((previous) => previous + 1);
    };

    return {
        activeSetIndex,
        completedExerciseCount,
        control,
        currentExercise,
        currentIndex,
        currentMetric,
        errors,
        handleNextSet,
        handlePreviousSet,
        isSubmitting: createWorkoutLogMutation.isPending,
        onSubmitCurrentExercise: handleSubmit(submitCurrentExercise),
        plannedSetCount,
        progressValue,
        readinessScore,
        selectedExerciseId,
        sessionFeedbackScore,
        setActiveSetIndex,
        setFields,
        setReadinessScore,
        setSelectedExerciseId,
        setSessionFeedbackScore,
        totalExercises,
        watchedSets,
    };
};