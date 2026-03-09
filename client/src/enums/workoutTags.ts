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

export const WORKOUT_TAG_LABELS: Record<WorkoutTagValue, string> = {
    [WorkoutTag.STRENGTH]: "Snaga",
    [WorkoutTag.SPEED]: "Brzina",
    [WorkoutTag.PLYOMETRICS]: "Pliometrija",
    [WorkoutTag.MOBILITY]: "Mobilnost",
    [WorkoutTag.CORE]: "Trup",
    [WorkoutTag.ENDURANCE]: "Izdržljivost",
    [WorkoutTag.RECOVERY]: "Oporavak",
};

export const WORKOUT_TAG_OPTIONS = Object.values(WorkoutTag).map((tag) => ({
    value: tag,
    label: WORKOUT_TAG_LABELS[tag],
}));
