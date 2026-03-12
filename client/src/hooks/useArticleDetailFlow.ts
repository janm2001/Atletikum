import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    useToggleArticleBookmark,
    useUpdateArticleProgress,
} from "@/hooks/useArticle";
import { useArticleDetailQuizResultState } from "@/hooks/useArticleDetailQuizResultState";
import { useQuizStatus } from "@/hooks/useQuiz";
import type { Article, ArticleSummary } from "@/types/Article/article";
import type { ArticleDetailLocationState } from "@/utils/articleDetailQuizResult";
import { clearPersistedArticleQuizResult } from "@/utils/flowSessionStorage";

type UseArticleDetailFlowParams = {
    article?: Article | null;
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
    const { quizResult, handleCloseQuizResult } = useArticleDetailQuizResultState({
        articleId,
        locationPathname: location.pathname,
        locationState,
        navigate,
        quizStatus,
    });

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
