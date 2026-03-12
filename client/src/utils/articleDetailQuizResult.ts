import type {
  ArticleQuizResult,
  QuizCompletion,
  QuizStatus,
} from "@/types/Article/quiz";

export type ArticleDetailLocationState = {
  quizResult?: ArticleQuizResult;
} | null;

type FailedQuizResultStateParams = {
  activeQuizResult: ArticleQuizResult | null;
  backendFailedCompletion: QuizCompletion | null;
  nextAvailableAt?: string | null;
};

type SyncedFailedQuizResultParams = FailedQuizResultStateParams & {
  isStoredFailureCurrent: boolean;
};

type VisibleArticleQuizResultParams = {
  quizResultId: string | null;
  dismissedQuizResultId: string | null;
  isStoredFailureCurrent: boolean;
  syncedQuizResult: ArticleQuizResult | null;
};

type PersistSyncedFailedQuizResultParams = {
  activeQuizResult: ArticleQuizResult | null;
  articleId: string;
  syncedQuizResult: ArticleQuizResult | null;
};

type ClearStaleFailedQuizResultParams = {
  activeQuizResult: ArticleQuizResult | null;
  articleId: string;
  isStoredFailureCurrent: boolean;
};

const doesQuizResultMatchBackendFailure = ({
  activeQuizResult,
  backendFailedCompletion,
}: Pick<
  FailedQuizResultStateParams,
  "activeQuizResult" | "backendFailedCompletion"
>) => {
  if (!activeQuizResult || !backendFailedCompletion) {
    return false;
  }

  if (activeQuizResult.completedAt && backendFailedCompletion.completedAt) {
    return activeQuizResult.completedAt === backendFailedCompletion.completedAt;
  }

  return (
    activeQuizResult.completedAt === undefined &&
    activeQuizResult.score === backendFailedCompletion.score &&
    activeQuizResult.totalQuestions === backendFailedCompletion.totalQuestions &&
    backendFailedCompletion.passed === false
  );
};

export const getArticleQuizResultIdentity = (
  articleId: string,
  quizResult: ArticleQuizResult | null,
) => {
  if (!quizResult) {
    return null;
  }

  const fallbackIdentity = [
    quizResult.score,
    quizResult.totalQuestions,
    quizResult.passed,
    quizResult.xpGained,
  ].join(":");

  return `${articleId}:${quizResult.completedAt ?? fallbackIdentity}`;
};

export const getBackendFailedQuizCompletion = (quizStatus?: QuizStatus | null) =>
  quizStatus?.lastCompletion?.passed === false ? quizStatus.lastCompletion : null;

export const isFailedQuizResultCurrent = ({
  activeQuizResult,
  backendFailedCompletion,
  nextAvailableAt,
}: FailedQuizResultStateParams) => {
  if (activeQuizResult?.passed !== false || !backendFailedCompletion) {
    return true;
  }

  return (
    doesQuizResultMatchBackendFailure({
      activeQuizResult,
      backendFailedCompletion,
    }) && Boolean(nextAvailableAt)
  );
};

export const syncFailedQuizResult = ({
  activeQuizResult,
  backendFailedCompletion,
  nextAvailableAt,
  isStoredFailureCurrent,
}: SyncedFailedQuizResultParams) => {
  if (
    activeQuizResult?.passed !== false ||
    !backendFailedCompletion ||
    !isStoredFailureCurrent
  ) {
    return activeQuizResult;
  }

  return {
    ...activeQuizResult,
    xpGained: backendFailedCompletion.xpGained,
    score: backendFailedCompletion.score,
    totalQuestions: backendFailedCompletion.totalQuestions,
    passed: backendFailedCompletion.passed,
    completedAt: backendFailedCompletion.completedAt,
    nextAvailableAt,
  };
};

export const hasStoredQuizResultSyncChanges = (
  activeQuizResult: ArticleQuizResult,
  syncedQuizResult: ArticleQuizResult,
) =>
  activeQuizResult.xpGained !== syncedQuizResult.xpGained ||
  activeQuizResult.score !== syncedQuizResult.score ||
  activeQuizResult.totalQuestions !== syncedQuizResult.totalQuestions ||
  activeQuizResult.passed !== syncedQuizResult.passed ||
  activeQuizResult.completedAt !== syncedQuizResult.completedAt ||
  activeQuizResult.nextAvailableAt !== syncedQuizResult.nextAvailableAt;

export const getVisibleArticleQuizResult = ({
  quizResultId,
  dismissedQuizResultId,
  isStoredFailureCurrent,
  syncedQuizResult,
}: VisibleArticleQuizResultParams) =>
  syncedQuizResult &&
  quizResultId !== dismissedQuizResultId &&
  isStoredFailureCurrent
    ? syncedQuizResult
    : null;

export const shouldRestoreRouteQuizResult = (
  articleId: string,
  locationQuizResult?: ArticleQuizResult | null,
) => Boolean(articleId && locationQuizResult);

export const shouldPersistSyncedFailedQuizResult = ({
  activeQuizResult,
  articleId,
  syncedQuizResult,
}: PersistSyncedFailedQuizResultParams) =>
  Boolean(
    articleId &&
      activeQuizResult &&
      syncedQuizResult &&
      syncedQuizResult.passed === false &&
      hasStoredQuizResultSyncChanges(activeQuizResult, syncedQuizResult),
  );

export const shouldClearStaleFailedQuizResult = ({
  activeQuizResult,
  articleId,
  isStoredFailureCurrent,
}: ClearStaleFailedQuizResultParams) =>
  Boolean(articleId && activeQuizResult?.passed === false && !isStoredFailureCurrent);
