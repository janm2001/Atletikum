import i18next from "i18next";

export const MuscleGroup = {
    QUADRICEPS: "QUADRICEPS",
    HAMSTRINGS: "HAMSTRINGS",
    GLUTES: "GLUTES",
    CALVES: "CALVES",
    HIP_FLEXORS: "HIP_FLEXORS",
    CORE: "CORE",
    LOWER_BACK: "LOWER_BACK",
    BACK: "BACK",
    SHOULDERS: "SHOULDERS",
    ANKLES: "ANKLES",
    THORACIC_SPINE: "THORACIC_SPINE",
} as const;

export type MuscleGroupValue =
    (typeof MuscleGroup)[keyof typeof MuscleGroup];

export const getMuscleGroupLabel = (value: MuscleGroupValue) =>
    i18next.t(`enums.muscleGroups.${value}`);

export const getMuscleGroupOptions = () => [
    { value: "ALL", label: i18next.t('enums.muscleGroups.ALL') },
    ...Object.values(MuscleGroup).map((value) => ({
        value,
        label: i18next.t(`enums.muscleGroups.${value}`),
    })),
];
