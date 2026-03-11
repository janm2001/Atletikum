import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    useToggleArticleBookmark,
    useUpdateArticleProgress,
} from "@/hooks/useArticle";
import { useQuizStatus } from "@/hooks/useQuiz";
import type { Article, ArticleSummary } from "@/types/Article/article";
import type { ArticleQuizResult } from "@/types/Article/quiz";

type ArticleDetailLocationState = {
    quizResult?: ArticleQuizResult;
} | null;

type UseArticleDetailFlowParams = {
    article?: Article | null;
};

export const useArticleDetailFlow = ({
    article,
}: UseArticleDetailFlowParams) => {
    const navigate = useNavigate();
    const location = useLocation();
    const toggleBookmarkMutation = useToggleArticleBookmark();
    const updateProgressMutation = useUpdateArticleProgress();
    const hasTrackedOpenRef = useRef(false);

    const hasQuiz = Boolean(article?.quiz && article.quiz.length > 0);
    const { data: quizStatus } = useQuizStatus(hasQuiz ? article?._id ?? "" : "");

    const locationState = location.state as ArticleDetailLocationState;
    const [quizResult, setQuizResult] = useState<ArticleQuizResult | null>(
        locationState?.quizResult ?? null,
    );

    useEffect(() => {
        if (!locationState?.quizResult) {
            return;
        }

        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, locationState?.quizResult, navigate]);

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
        setQuizResult(null);
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