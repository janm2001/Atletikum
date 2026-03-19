import { beforeEach, describe, expect, it } from "vitest";
import type { WorkoutDraft } from "@/types/Workout/workoutDraft";
import {
  clearDraft,
  getDraft,
  getDraftKey,
  saveDraft,
} from "@/utils/workoutDraftStorage";

const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const createTestDraft = (overrides?: Partial<WorkoutDraft>): WorkoutDraft => ({
  version: 1,
  workoutId: "w1",
  exerciseIndex: 0,
  completedExercises: [],
  currentSetValues: [{ loadKg: 50, resultValue: 8, rpe: 7 }],
  idempotencyKey: "test-uuid",
  submitting: false,
  startedAt: new Date().toISOString(),
  lastSavedAt: new Date().toISOString(),
  ...overrides,
});

describe("workoutDraftStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getDraftKey returns namespaced key", () => {
    expect(getDraftKey("w1")).toBe("atletikum_workout_draft_w1");
  });

  it("saveDraft writes to localStorage and getDraft reads it back", () => {
    const draft = createTestDraft();
    saveDraft(draft);
    expect(getDraft("w1")).toEqual(draft);
  });

  it("getDraft returns null when no draft exists", () => {
    expect(getDraft("nonexistent")).toBeNull();
  });

  it("getDraft returns null and removes expired draft", () => {
    const expired = createTestDraft({
      lastSavedAt: new Date(Date.now() - DRAFT_TTL_MS - 1000).toISOString(),
    });
    localStorage.setItem(getDraftKey("w1"), JSON.stringify(expired));
    expect(getDraft("w1")).toBeNull();
    expect(localStorage.getItem(getDraftKey("w1"))).toBeNull();
  });

  it("clearDraft removes the draft", () => {
    saveDraft(createTestDraft());
    clearDraft("w1");
    expect(getDraft("w1")).toBeNull();
  });

  it("getDraft returns null on corrupted JSON", () => {
    localStorage.setItem(getDraftKey("w1"), "not-json");
    expect(getDraft("w1")).toBeNull();
  });
});
