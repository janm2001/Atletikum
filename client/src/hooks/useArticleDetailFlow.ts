import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    useToggleArticleBookmark,
    useUpdateArticleProgress,
} from "@/hooks/useArticle";
import { useQuizStatus } from "@/hooks/useQuiz";
import type { Article, ArticleSummary } from "@/types/Article/article";
import type { ArticleQuizResult } from "@/types/Article/quiz";
import {
    clearPersistedArticleQuizResult,
    getPersistedArticleQuizResult,
    persistArticleQuizResult,
} from "@/utils/flowSessionStorage";

type ArticleDetailLocationState = {
    quizResult?: ArticleQuizResult;
} | null;

type UseArticleDetailFlowParams = {
    article?: Article | null;
};

const getQuizResultIdentity = (
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

export const useArticleDetailFlow = ({
    article,
}: UseArticleDetailFlowParams) => {
    const { id: routeArticleId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const toggleBookmarkMutation = useToggleArticleBookmark();
    const updateProgressMutation = useUpdateArticleProgress();
    const hasTrackedOpenRef = useRef(false);
    const articleId = article?._id ?? routeArticleId ?? "";

    const hasQuiz = Boolean(article?.quiz && article.quiz.length > 0);
    const { data: quizStatus } = useQuizStatus(hasQuiz ? articleId : "");

    const locationState = location.state as ArticleDetailLocationState;
    const [dismissedQuizResultId, setDismissedQuizResultId] = useState<string | null>(
        null,
    );
    const persistedQuizResult = articleId
        ? getPersistedArticleQuizResult(articleId)
        : null;
    const activeQuizResult = locationState?.quizResult ?? persistedQuizResult;
    const activeQuizResultId = getQuizResultIdentity(articleId, activeQuizResult);
    const backendFailedCompletion = quizStatus?.lastCompletion?.passed === false
        ? quizStatus.lastCompletion
        : null;
    const isStoredFailureCurrent = (() => {
        if (activeQuizResult?.passed !== false || !backendFailedCompletion) {
            return true;
        }

        return (
            ((activeQuizResult.completedAt &&
                backendFailedCompletion.completedAt &&
                activeQuizResult.completedAt === backendFailedCompletion.completedAt) ||
                (activeQuizResult.completedAt === undefined &&
                    activeQuizResult.score === backendFailedCompletion.score &&
                    activeQuizResult.totalQuestions ===
                        backendFailedCompletion.totalQuestions &&
                    backendFailedCompletion.passed === false)) &&
            Boolean(quizStatus?.nextAvailableAt)
        );
    })();
    const syncedQuizResult = useMemo(
        () =>
            activeQuizResult?.passed === false &&
            backendFailedCompletion &&
            isStoredFailureCurrent
                ? {
                      ...activeQuizResult,
                      xpGained: backendFailedCompletion.xpGained,
                      score: backendFailedCompletion.score,
                      totalQuestions: backendFailedCompletion.totalQuestions,
                      passed: backendFailedCompletion.passed,
                      completedAt: backendFailedCompletion.completedAt,
                      nextAvailableAt: quizStatus?.nextAvailableAt,
                  }
                : activeQuizResult,
        [
            activeQuizResult,
            backendFailedCompletion,
            isStoredFailureCurrent,
            quizStatus?.nextAvailableAt,
        ],
    );
    const quizResult =
        syncedQuizResult &&
        activeQuizResultId !== dismissedQuizResultId &&
        isStoredFailureCurrent
            ? syncedQuizResult
            : null;

    useEffect(() => {
        if (!articleId || !locationState?.quizResult) {
            return;
        }

        persistArticleQuizResult(articleId, locationState.quizResult);
        navigate(location.pathname, { replace: true, state: null });
    }, [articleId, location.pathname, locationState?.quizResult, navigate]);

    useEffect(() => {
        if (
            !articleId ||
            !syncedQuizResult ||
            syncedQuizResult.passed !== false ||
            !activeQuizResult
        ) {
            return;
        }

        if (
            activeQuizResult.xpGained === syncedQuizResult.xpGained &&
            activeQuizResult.score === syncedQuizResult.score &&
            activeQuizResult.totalQuestions === syncedQuizResult.totalQuestions &&
            activeQuizResult.passed === syncedQuizResult.passed &&
            activeQuizResult.completedAt === syncedQuizResult.completedAt &&
            activeQuizResult.nextAvailableAt === syncedQuizResult.nextAvailableAt
        ) {
            return;
        }

        persistArticleQuizResult(articleId, syncedQuizResult);
    }, [activeQuizResult, articleId, syncedQuizResult]);

    useEffect(() => {
        if (!articleId || activeQuizResult?.passed !== false || isStoredFailureCurrent) {
            return;
        }

        clearPersistedArticleQuizResult(articleId);
    }, [activeQuizResult?.passed, articleId, isStoredFailureCurrent]);

    useEffect(() => {
        if (!article || hasTrackedOpenRef.current) {
            return;
        }

        hasTrackedOpenRef.current = true;
        const currentProgress = article.bookmark?.progressPercent ?? 0;

        if (currentProgress < 25) {
            updateProgressMutation.mutate({
                articleId: article._id,
                progressPercent: 25,
            });
        }
    }, [article, updateProgressMutation]);

    const handleBack = () => {
        navigate("/edukacija");
    };

    const handleCloseQuizResult = () => {
        setDismissedQuizResultId(activeQuizResultId);
        clearPersistedArticleQuizResult(articleId);
    };

    const handleToggleBookmark = () => {
        if (!article) {
            return;
        }

        toggleBookmarkMutation.mutate({
            articleId: article._id,
            shouldBookmark: !article.bookmark?.isBookmarked,
        });
    };

    const handleMarkAsRead = () => {
        if (!article) {
            return;
        }

        updateProgressMutation.mutate({
            articleId: article._id,
            progressPercent: 100,
            isCompleted: true,
        });
    };

    const handleStartQuiz = (articleId: string) => {
        clearPersistedArticleQuizResult(articleId);
        navigate(`/edukacija/${articleId}/kviz`);
    };

    const handleNavigateArticle = (nextId: string) => {
        navigate(`/edukacija/${nextId}`);
    };

    const handleToggleRelatedBookmark = (relatedArticle: ArticleSummary) => {
        toggleBookmarkMutation.mutate({
            articleId: relatedArticle._id,
            shouldBookmark: !relatedArticle.bookmark?.isBookmarked,
        });
    };

    return {
        quizStatus,
        quizResult,
        handleBack,
        handleCloseQuizResult,
        handleMarkAsRead,
        handleNavigateArticle,
        handleStartQuiz,
        handleToggleBookmark,
        handleToggleRelatedBookmark,
    };
};
