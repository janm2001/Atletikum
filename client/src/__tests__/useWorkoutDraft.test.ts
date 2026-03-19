import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { getDraft } from "@/utils/workoutDraftStorage";
import type { Workout } from "@/types/Workout/workout";

const createTestWorkout = (): Workout => ({
  _id: "w1",
  title: "Test Workout",
  description: "Test",
  requiredLevel: 1,
  exercises: [
    {
      exerciseId: "e1",
      sets: 3,
      reps: "8",
      rpe: "7",
      baseXp: 10,
    },
    {
      exerciseId: "e2",
      sets: 3,
      reps: "10",
      rpe: "6",
      baseXp: 10,
    },
  ],
});

describe("useWorkoutDraft", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with no draft source when no saved draft exists", () => {
    const { result } = renderHook(() =>
      useWorkoutDraft({ workout: createTestWorkout() }),
    );
    expect(result.current.hasDraft).toBe(false);
    expect(result.current.draftSource).toBeNull();
  });

  it("startFresh creates a draft and persists it", () => {
    const { result } = renderHook(() =>
      useWorkoutDraft({ workout: createTestWorkout() }),
    );

    act(() => result.current.startFresh());

    expect(result.current.draftSource).toBe("fresh");
    expect(getDraft("w1")).not.toBeNull();
  });

  it("discardDraft clears the draft", () => {
    const { result } = renderHook(() =>
      useWorkoutDraft({ workout: createTestWorkout() }),
    );

    act(() => result.current.startFresh());
    act(() => result.current.discardDraft());

    expect(getDraft("w1")).toBeNull();
    expect(result.current.draftSource).toBeNull();
  });
});
