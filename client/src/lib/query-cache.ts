import type {
    Article,
    ArticleBookmarkState,
    ArticleSummary,
} from '@/types/Article/article';
import type { QuizStatus, QuizSubmitResult } from '@/types/Article/quiz';

type EntityWithId = {
    _id: string;
};

export const replaceCachedEntity = <T extends EntityWithId>(
    entities: T[] | undefined,
    entity: T,
): T[] | undefined => {
    if (!entities) {
        return entities;
    }

    let didChange = false;
    const nextEntities = entities.map((currentEntity) => {
        if (currentEntity._id !== entity._id) {
            return currentEntity;
        }

        didChange = true;
        return entity;
    });

    return didChange ? nextEntities : entities;
};

export const removeCachedEntity = <T extends EntityWithId>(
    entities: T[] | undefined,
    entityId: string,
): T[] | undefined => {
    if (!entities) {
        return entities;
    }

    const nextEntities = entities.filter(
        (currentEntity) => currentEntity._id !== entityId,
    );

    return nextEntities.length === entities.length ? entities : nextEntities;
};

export const prependCachedEntity = <T extends EntityWithId>(
    entities: T[] | undefined,
    entity: T,
): T[] => [
    entity,
    ...(entities?.filter((currentEntity) => currentEntity._id !== entity._id) ??
        []),
];

export const toArticleSummary = (article: Article): ArticleSummary => {
    const summary = { ...article } as Partial<Article>;
    delete summary.quiz;
    return summary as ArticleSummary;
};

export const updateArticleBookmarkInList = (
    articles: ArticleSummary[] | undefined,
    articleId: string,
    bookmark: ArticleBookmarkState,
    options?: { remove?: boolean },
): ArticleSummary[] | undefined => {
    if (!articles) {
        return articles;
    }

    let didChange = false;
    const nextArticles: ArticleSummary[] = [];

    for (const article of articles) {
        if (article._id !== articleId) {
            nextArticles.push(article);
            continue;
        }

        didChange = true;

        if (!options?.remove) {
            nextArticles.push({
                ...article,
                bookmark,
            });
        }
    }

    return didChange ? nextArticles : articles;
};

export const updateArticleBookmarkInDetail = (
    article: Article | undefined,
    articleId: string,
    bookmark: ArticleBookmarkState,
): Article | undefined => {
    if (!article) {
        return article;
    }

    let didChange = false;
    const nextRelatedArticles = article.relatedArticles?.map((relatedArticle) => {
        if (relatedArticle._id !== articleId) {
            return relatedArticle;
        }

        didChange = true;
        return {
            ...relatedArticle,
            bookmark,
        };
    });

    if (article._id !== articleId && !didChange) {
        return article;
    }

    return {
        ...article,
        ...(article._id === articleId ? { bookmark } : {}),
        ...(nextRelatedArticles ? { relatedArticles: nextRelatedArticles } : {}),
    };
};

export const addArticleToQuizCompletions = (
    completedArticleIds: string[] | undefined,
    articleId: string,
): string[] => {
    if (!completedArticleIds) {
        return [articleId];
    }

    if (completedArticleIds.includes(articleId)) {
        return completedArticleIds;
    }

    return [...completedArticleIds, articleId];
};

export const syncQuizStatusAfterSubmission = (
    submission: QuizSubmitResult['data'],
): QuizStatus => ({
    canTakeQuiz: false,
    lastCompletion: submission.completion,
    nextAvailableAt: submission.nextAvailableAt,
});

export const removeArticleFromDetailCache = (
    article: Article | undefined,
    articleId: string,
): Article | undefined => {
    if (!article) {
        return article;
    }

    if (article._id === articleId) {
        return undefined;
    }

    if (!article.relatedArticles) {
        return article;
    }

    const nextRelatedArticles = article.relatedArticles.filter(
        (relatedArticle) => relatedArticle._id !== articleId,
    );

    return nextRelatedArticles.length === article.relatedArticles.length
        ? article
        : {
            ...article,
            relatedArticles: nextRelatedArticles,
        };
};
