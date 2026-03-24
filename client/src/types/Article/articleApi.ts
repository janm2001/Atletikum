import type {
    Article,
    ArticleBookmarkState,
    ArticleSummary,
} from "@/types/Article/article";

export type ArticlesPayload = {
    articles: ArticleSummary[];
};

export type ArticlePayload = {
    article: Article;
};

export type BookmarkPayload = {
    bookmark: ArticleBookmarkState;
};

export type ArticleQueryOptions = {
    tags?: string[];
    savedOnly?: boolean;
    q?: string;
};

export type ArticlesResponse = {
    status: string;
    results: number;
    data: ArticlesPayload;
};

export type ArticleResponse = {
    status: string;
    data: ArticlePayload;
};

export type BookmarkResponse = {
    status: string;
    data: BookmarkPayload;
};