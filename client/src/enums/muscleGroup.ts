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

export const MUSCLE_GROUP_OPTIONS = [
    { value: "ALL", label: "Sve mišićne skupine" },
    ...Object.values(MuscleGroup).map((value) => ({
        value,
        label: value.replaceAll("_", " "),
    })),
];
