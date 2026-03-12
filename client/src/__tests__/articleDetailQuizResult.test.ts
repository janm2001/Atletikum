import { describe, expect, it } from "vitest";
import type { ArticleQuizResult } from "@/types/Article/quiz";
import {
  getArticleQuizResultIdentity,
  getBackendFailedQuizCompletion,
  getVisibleArticleQuizResult,
  hasStoredQuizResultSyncChanges,
  isFailedQuizResultCurrent,
  shouldClearStaleFailedQuizResult,
  shouldPersistSyncedFailedQuizResult,
  shouldRestoreRouteQuizResult,
  syncFailedQuizResult,
} from "@/utils/articleDetailQuizResult";

const failedQuizResult: ArticleQuizResult = {
  xpGained: 0,
  score: 2,
  totalQuestions: 5,
  passed: false,
  completedAt: "2026-03-12T10:00:00.000Z",
  nextAvailableAt: "2026-03-13T10:00:00.000Z",
};

describe("articleDetailQuizResult helpers", () => {
  it("builds quiz-result identities from completedAt or fallback fields", () => {
    expect(
      getArticleQuizResultIdentity("article-1", failedQuizResult),
    ).toBe("article-1:2026-03-12T10:00:00.000Z");
    expect(
      getArticleQuizResultIdentity("article-1", {
        xpGained: 25,
        score: 4,
        totalQuestions: 5,
        passed: true,
      }),
    ).toBe("article-1:4:5:true:25");
    expect(getArticleQuizResultIdentity("article-1", null)).toBeNull();
  });

  it("returns only failed backend completions for sync", () => {
    expect(
      getBackendFailedQuizCompletion({
        canTakeQuiz: false,
        lastCompletion: {
          score: 2,
          totalQuestions: 5,
          xpGained: 0,
          completedAt: "2026-03-12T10:00:00.000Z",
          passed: false,
        },
        nextAvailableAt: "2026-03-13T10:00:00.000Z",
      }),
    ).toEqual({
      score: 2,
      totalQuestions: 5,
      xpGained: 0,
      completedAt: "2026-03-12T10:00:00.000Z",
      passed: false,
    });
    expect(
      getBackendFailedQuizCompletion({
        canTakeQuiz: true,
        lastCompletion: {
          score: 5,
          totalQuestions: 5,
          xpGained: 30,
          completedAt: "2026-03-12T10:00:00.000Z",
          passed: true,
        },
        nextAvailableAt: null,
      }),
    ).toBeNull();
  });

  it("treats a stored failed result as current only when backend failure and cooldown still match", () => {
    expect(
      isFailedQuizResultCurrent({
        activeQuizResult: failedQuizResult,
        backendFailedCompletion: {
          score: 2,
          totalQuestions: 5,
          xpGained: 0,
          completedAt: "2026-03-12T10:00:00.000Z",
          passed: false,
        },
        nextAvailableAt: "2026-03-13T10:00:00.000Z",
      }),
    ).toBe(true);
    expect(
      isFailedQuizResultCurrent({
        activeQuizResult: failedQuizResult,
        backendFailedCompletion: {
          score: 2,
          totalQuestions: 5,
          xpGained: 0,
          completedAt: "2026-03-12T10:00:00.000Z",
          passed: false,
        },
        nextAvailableAt: null,
      }),
    ).toBe(false);
    expect(
      isFailedQuizResultCurrent({
        activeQuizResult: failedQuizResult,
        backendFailedCompletion: null,
        nextAvailableAt: null,
      }),
    ).toBe(true);
  });

  it("falls back to score matching when the stored failure has no completion timestamp", () => {
    expect(
      isFailedQuizResultCurrent({
        activeQuizResult: {
          xpGained: 0,
          score: 2,
          totalQuestions: 5,
          passed: false,
        },
        backendFailedCompletion: {
          score: 2,
          totalQuestions: 5,
          xpGained: 0,
          completedAt: "2026-03-12T10:00:00.000Z",
          passed: false,
        },
        nextAvailableAt: "2026-03-13T10:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("syncs current failed results with backend quizStatus fields", () => {
    expect(
      syncFailedQuizResult({
        activeQuizResult: {
          ...failedQuizResult,
          xpGained: 5,
          nextAvailableAt: "2026-03-12T15:00:00.000Z",
        },
        backendFailedCompletion: {
          score: 1,
          totalQuestions: 5,
          xpGained: 0,
          completedAt: "2026-03-12T11:00:00.000Z",
          passed: false,
        },
        nextAvailableAt: "2026-03-13T11:00:00.000Z",
        isStoredFailureCurrent: true,
      }),
    ).toEqual({
      xpGained: 0,
      score: 1,
      totalQuestions: 5,
      passed: false,
      completedAt: "2026-03-12T11:00:00.000Z",
      nextAvailableAt: "2026-03-13T11:00:00.000Z",
    });
    expect(
      syncFailedQuizResult({
        activeQuizResult: {
          xpGained: 25,
          score: 4,
          totalQuestions: 5,
          passed: true,
        },
        backendFailedCompletion: {
          score: 1,
          totalQuestions: 5,
          xpGained: 0,
          completedAt: "2026-03-12T11:00:00.000Z",
          passed: false,
        },
        nextAvailableAt: "2026-03-13T11:00:00.000Z",
        isStoredFailureCurrent: true,
      }),
    ).toEqual({
      xpGained: 25,
      score: 4,
      totalQuestions: 5,
      passed: true,
    });
  });

  it("tracks persistence decisions for route restore, sync updates, stale cleanup, and visibility", () => {
    const syncedQuizResult = {
      ...failedQuizResult,
      nextAvailableAt: "2026-03-14T10:00:00.000Z",
    };

    expect(shouldRestoreRouteQuizResult("article-1", failedQuizResult)).toBe(true);
    expect(shouldRestoreRouteQuizResult("", failedQuizResult)).toBe(false);
    expect(
      hasStoredQuizResultSyncChanges(failedQuizResult, syncedQuizResult),
    ).toBe(true);
    expect(
      shouldPersistSyncedFailedQuizResult({
        activeQuizResult: failedQuizResult,
        articleId: "article-1",
        syncedQuizResult,
      }),
    ).toBe(true);
    expect(
      shouldClearStaleFailedQuizResult({
        activeQuizResult: failedQuizResult,
        articleId: "article-1",
        isStoredFailureCurrent: false,
      }),
    ).toBe(true);
    expect(
      getVisibleArticleQuizResult({
        quizResultId: "article-1:2026-03-12T10:00:00.000Z",
        dismissedQuizResultId: null,
        isStoredFailureCurrent: true,
        syncedQuizResult,
      }),
    ).toEqual(syncedQuizResult);
    expect(
      getVisibleArticleQuizResult({
        quizResultId: "article-1:2026-03-12T10:00:00.000Z",
        dismissedQuizResultId: "article-1:2026-03-12T10:00:00.000Z",
        isStoredFailureCurrent: true,
        syncedQuizResult,
      }),
    ).toBeNull();
  });

  it("dismisses the currently displayed synced result even when its identity differs from the stored fallback", () => {
    const storedFailedResult: ArticleQuizResult = {
      xpGained: 0,
      score: 2,
      totalQuestions: 5,
      passed: false,
    };
    const syncedQuizResult = {
      ...storedFailedResult,
      completedAt: "2026-03-12T11:00:00.000Z",
      nextAvailableAt: "2026-03-13T11:00:00.000Z",
    };

    expect(
      getArticleQuizResultIdentity("article-1", storedFailedResult),
    ).toBe("article-1:2:5:false:0");
    expect(
      getArticleQuizResultIdentity("article-1", syncedQuizResult),
    ).toBe("article-1:2026-03-12T11:00:00.000Z");
    expect(
      getVisibleArticleQuizResult({
        quizResultId: "article-1:2026-03-12T11:00:00.000Z",
        dismissedQuizResultId: "article-1:2026-03-12T11:00:00.000Z",
        isStoredFailureCurrent: true,
        syncedQuizResult,
      }),
    ).toBeNull();
  });
});
