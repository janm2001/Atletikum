import i18next from "i18next";

export const WorkoutTag = {
    STRENGTH: "STRENGTH",
    SPEED: "SPEED",
    PLYOMETRICS: "PLYOMETRICS",
    MOBILITY: "MOBILITY",
    CORE: "CORE",
    ENDURANCE: "ENDURANCE",
    RECOVERY: "RECOVERY",
} as const;

export type WorkoutTagValue = (typeof WorkoutTag)[keyof typeof WorkoutTag];

export const getWorkoutTagLabel = (tag: WorkoutTagValue): string =>
    i18next.t(`enums.workoutTags.${tag}`);

export const getWorkoutTagOptions = () =>
    Object.values(WorkoutTag).map((tag) => ({
        value: tag,
        label: i18next.t(`enums.workoutTags.${tag}`),
    }));
