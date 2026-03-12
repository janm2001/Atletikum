import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CelebrationState } from "@/types/Celebration/celebration";
import {
  clearPersistedArticleQuizResult,
  clearPersistedCelebrationState,
  getPersistedArticleQuizResult,
  getPersistedCelebrationState,
  persistArticleQuizResult,
  persistCelebrationState,
} from "@/utils/flowSessionStorage";

class MemoryStorage implements Storage {
  private storage = new Map<string, string>();

  get length() {
    return this.storage.size;
  }

  clear() {
    this.storage.clear();
  }

  getItem(key: string) {
    return this.storage.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.storage.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.storage.delete(key);
  }

  setItem(key: string, value: string) {
    this.storage.set(key, value);
  }
}

const originalSessionStorage = globalThis.sessionStorage;

describe("flowSessionStorage", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "sessionStorage", {
      value: new MemoryStorage(),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    if (originalSessionStorage === undefined) {
      Reflect.deleteProperty(globalThis, "sessionStorage");
      return;
    }

    Object.defineProperty(globalThis, "sessionStorage", {
      value: originalSessionStorage,
      configurable: true,
      writable: true,
    });
  });

  it("persists and restores celebration state", () => {
    const state: CelebrationState = {
      type: "workout",
      xpGained: 120,
      title: "Sprint session",
      totalXp: 480,
      personalBests: [
        {
          exerciseId: "exercise-1",
          resultValue: 6,
          rpe: 8,
          metricType: "reps",
          unitLabel: "reps",
          exerciseName: "Sprint start",
        },
      ],
    };

    persistCelebrationState(state);

    expect(getPersistedCelebrationState()).toEqual(state);

    clearPersistedCelebrationState();
    expect(getPersistedCelebrationState()).toBeNull();
  });

  it("drops malformed celebration state from storage", () => {
    globalThis.sessionStorage.setItem("atletikum:celebration-state", "{");

    expect(getPersistedCelebrationState()).toBeNull();
    expect(
      globalThis.sessionStorage.getItem("atletikum:celebration-state"),
    ).toBeNull();
  });

  it("stores quiz results per article id", () => {
    persistArticleQuizResult("article-1", {
      xpGained: 0,
      score: 2,
      totalQuestions: 5,
      passed: false,
      completedAt: "2026-03-12T10:00:00.000Z",
      nextAvailableAt: "2026-03-13T10:00:00.000Z",
    });
    persistArticleQuizResult("article-2", {
      xpGained: 25,
      score: 4,
      totalQuestions: 5,
      passed: true,
    });

    expect(getPersistedArticleQuizResult("article-1")).toEqual({
      xpGained: 0,
      score: 2,
      totalQuestions: 5,
      passed: false,
      completedAt: "2026-03-12T10:00:00.000Z",
      nextAvailableAt: "2026-03-13T10:00:00.000Z",
    });
    expect(getPersistedArticleQuizResult("article-2")).toEqual({
      xpGained: 25,
      score: 4,
      totalQuestions: 5,
      passed: true,
    });

    clearPersistedArticleQuizResult("article-1");

    expect(getPersistedArticleQuizResult("article-1")).toBeNull();
    expect(getPersistedArticleQuizResult("article-2")).toEqual({
      xpGained: 25,
      score: 4,
      totalQuestions: 5,
      passed: true,
    });
  });
});
