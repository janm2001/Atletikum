export const TrainingFocus = {
    MOBILITY: "mobilnost",
    STRENGTH: "snaga",
    INJURY_PREVENTION: "prevencija_ozlijede",
} as const;

export const TRAINING_FOCUS_OPTIONS = [
    { value: TrainingFocus.MOBILITY, label: "Mobilnost" },
    { value: TrainingFocus.STRENGTH, label: "Snaga" },
    {
        value: TrainingFocus.INJURY_PREVENTION,
        label: "Prevencija ozlijede",
    },
];
