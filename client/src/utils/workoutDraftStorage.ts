import type { WorkoutDraft } from "@/types/Workout/workoutDraft";

const DRAFT_KEY_PREFIX = "atletikum_workout_draft_";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export const getDraftKey = (workoutId: string): string =>
  `${DRAFT_KEY_PREFIX}${workoutId}`;

export const getDraft = (workoutId: string): WorkoutDraft | null => {
  try {
    const raw = localStorage.getItem(getDraftKey(workoutId));
    if (!raw) return null;

    const draft = JSON.parse(raw) as WorkoutDraft;
    const age = Date.now() - new Date(draft.lastSavedAt).getTime();

    if (age > DRAFT_TTL_MS) {
      localStorage.removeItem(getDraftKey(workoutId));
      return null;
    }

    return draft;
  } catch {
    localStorage.removeItem(getDraftKey(workoutId));
    return null;
  }
};

export const saveDraft = (draft: WorkoutDraft): void => {
  try {
    localStorage.setItem(getDraftKey(draft.workoutId), JSON.stringify(draft));
  } catch {
    // Ignore storage failures — draft is best-effort
  }
};

export const clearDraft = (workoutId: string): void => {
  try {
    localStorage.removeItem(getDraftKey(workoutId));
  } catch {
    // Ignore
  }
};
