import { useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { QuizStatus } from "@/types/Article/quiz";
import {
  clearPersistedArticleQuizResult,
  getPersistedArticleQuizResult,
  persistArticleQuizResult,
} from "@/utils/flowSessionStorage";
import {
  type ArticleDetailLocationState,
  getArticleQuizResultIdentity,
  getBackendFailedQuizCompletion,
  getVisibleArticleQuizResult,
  isFailedQuizResultCurrent,
  shouldClearStaleFailedQuizResult,
  shouldPersistSyncedFailedQuizResult,
  shouldRestoreRouteQuizResult,
  syncFailedQuizResult,
} from "@/utils/articleDetailQuizResult";

type UseArticleDetailQuizResultStateParams = {
  articleId: string;
  locationPathname: string;
  locationState: ArticleDetailLocationState;
  navigate: NavigateFunction;
  quizStatus?: QuizStatus;
};

export const useArticleDetailQuizResultState = ({
  articleId,
  locationPathname,
  locationState,
  navigate,
  quizStatus,
}: UseArticleDetailQuizResultStateParams) => {
  const [dismissedQuizResultId, setDismissedQuizResultId] = useState<string | null>(
    null,
  );

  const persistedQuizResult = articleId
    ? getPersistedArticleQuizResult(articleId)
    : null;
  const activeQuizResult = locationState?.quizResult ?? persistedQuizResult;
  const backendFailedCompletion = getBackendFailedQuizCompletion(quizStatus);
  const isStoredFailureCurrent = isFailedQuizResultCurrent({
    activeQuizResult,
    backendFailedCompletion,
    nextAvailableAt: quizStatus?.nextAvailableAt,
  });
  const syncedQuizResult = useMemo(
    () =>
      syncFailedQuizResult({
        activeQuizResult,
        backendFailedCompletion,
        nextAvailableAt: quizStatus?.nextAvailableAt,
        isStoredFailureCurrent,
      }),
    [
      activeQuizResult,
      backendFailedCompletion,
      isStoredFailureCurrent,
      quizStatus?.nextAvailableAt,
    ],
  );
  const quizResultId = getArticleQuizResultIdentity(articleId, syncedQuizResult);
  const quizResult = useMemo(
    () =>
      getVisibleArticleQuizResult({
        quizResultId,
        dismissedQuizResultId,
        isStoredFailureCurrent,
        syncedQuizResult,
      }),
    [
      quizResultId,
      dismissedQuizResultId,
      isStoredFailureCurrent,
      syncedQuizResult,
    ],
  );

  useEffect(() => {
    const locationQuizResult = locationState?.quizResult;

    if (
      !locationQuizResult ||
      !shouldRestoreRouteQuizResult(articleId, locationQuizResult)
    ) {
      return;
    }

    persistArticleQuizResult(articleId, locationQuizResult);
    navigate(locationPathname, { replace: true, state: null });
  }, [articleId, locationPathname, locationState?.quizResult, navigate]);

  useEffect(() => {
    if (
      !syncedQuizResult ||
      !shouldPersistSyncedFailedQuizResult({
        activeQuizResult,
        articleId,
        syncedQuizResult,
      })
    ) {
      return;
    }

    persistArticleQuizResult(articleId, syncedQuizResult);
  }, [activeQuizResult, articleId, syncedQuizResult]);

  useEffect(() => {
    if (
      !shouldClearStaleFailedQuizResult({
        activeQuizResult,
        articleId,
        isStoredFailureCurrent,
      })
    ) {
      return;
    }

    clearPersistedArticleQuizResult(articleId);
  }, [activeQuizResult, articleId, isStoredFailureCurrent]);

  const handleCloseQuizResult = () => {
    setDismissedQuizResultId(quizResultId);
    clearPersistedArticleQuizResult(articleId);
  };

  return {
    quizResult,
    handleCloseQuizResult,
  };
};
