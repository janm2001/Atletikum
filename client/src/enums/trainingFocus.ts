import i18next from "i18next";

export const TrainingFocus = {
    MOBILITY: "mobilnost",
    STRENGTH: "snaga",
    INJURY_PREVENTION: "prevencija_ozlijede",
} as const;

export const getTrainingFocusOptions = () => [
    { value: TrainingFocus.MOBILITY, label: i18next.t('enums.trainingFocus.MOBILITY') },
    { value: TrainingFocus.STRENGTH, label: i18next.t('enums.trainingFocus.STRENGTH') },
    {
        value: TrainingFocus.INJURY_PREVENTION,
        label: i18next.t('enums.trainingFocus.INJURY_PREVENTION'),
    },
];
