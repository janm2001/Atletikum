import type {
    Article,
    ArticleBookmarkState,
    ArticleSummary,
} from "@/types/Article/article";
import type {
    ArticleQueryOptions,
    ArticleResponse,
    ArticlesResponse,
    BookmarkResponse,
} from "@/types/Article/articleApi";
import { apiClient } from "@/utils/apiService";

const API_URL = "/articles";

export async function getArticles(
    options?: ArticleQueryOptions,
): Promise<ArticleSummary[]> {
    const tags = options?.tags;
    const savedOnly = options?.savedOnly ?? false;
    const q = options?.q?.trim();

    const { data } = await apiClient.get<ArticlesResponse>(API_URL, {
        params: {
            ...(tags && tags.length > 0 ? { tag: tags } : {}),
            ...(savedOnly ? { saved: true } : {}),
            ...(q ? { q } : {}),
        },
    });

    return data.data.articles;
}

export async function getArticleDetail(id: string): Promise<Article> {
    const { data } = await apiClient.get<ArticleResponse>(`${API_URL}/${id}`);
    return data.data.article;
}

export async function createArticle({
    articleData,
    isFormData,
}: {
    articleData: Partial<Article>;
    isFormData?: boolean;
}): Promise<Article> {
    const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
    const { data } = await apiClient.post<ArticleResponse>(API_URL, articleData, {
        headers,
    });
    return data.data.article;
}

export async function updateArticle({
    id,
    updatedData,
    isFormData,
}: {
    id: string;
    updatedData: Partial<Article>;
    isFormData?: boolean;
}): Promise<Article> {
    const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
    const { data } = await apiClient.patch<ArticleResponse>(
        `${API_URL}/${id}`,
        updatedData,
        { headers },
    );
    return data.data.article;
}

export async function deleteArticle(id: string): Promise<void> {
    await apiClient.delete(`${API_URL}/${id}`);
}

export async function toggleArticleBookmark({
    articleId,
    shouldBookmark,
}: {
    articleId: string;
    shouldBookmark: boolean;
}): Promise<ArticleBookmarkState> {
    const method = shouldBookmark ? "post" : "delete";
    const { data } = await apiClient[method]<BookmarkResponse>(
        `${API_URL}/${articleId}/bookmark`,
    );
    return data.data.bookmark;
}

export async function updateArticleProgress({
    articleId,
    progressPercent,
    isCompleted,
}: {
    articleId: string;
    progressPercent: number;
    isCompleted?: boolean;
}): Promise<ArticleBookmarkState> {
    const { data } = await apiClient.patch<BookmarkResponse>(
        `${API_URL}/${articleId}/progress`,
        {
            progressPercent,
            isCompleted,
        },
    );
    return data.data.bookmark;
}