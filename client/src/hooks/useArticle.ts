import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keys } from "../lib/query-keys";
import { apiClient } from "../utils/apiService";
import type {
  Article,
  ArticleBookmarkState,
  ArticleSummary,
} from "../types/Article/article";

const API_URL = "/articles";

export const useArticles = (options?: { tags?: string[]; savedOnly?: boolean }) => {
  const tags = options?.tags;
  const savedOnly = options?.savedOnly ?? false;

  return useQuery({
    queryKey:
      savedOnly
        ? [...keys.knowledgeBase.saved(), ...(tags ?? [])]
        : tags && tags.length > 0
          ? keys.knowledgeBase.categories(tags)
          : keys.knowledgeBase.all,
    queryFn: async (): Promise<ArticleSummary[]> => {
      const { data } = await apiClient.get(API_URL, {
        params: {
          ...(tags && tags.length > 0 ? { tag: tags } : {}),
          ...(savedOnly ? { saved: true } : {}),
        },
      });
      return data.data.articles;
    },
  });
};

export const useArticleDetail = (id: string) => {
  return useQuery({
    queryKey: keys.knowledgeBase.detail(id),
    queryFn: async (): Promise<Article> => {
      const { data } = await apiClient.get(`${API_URL}/${id}`);
      return data.data.article;
    },
    enabled: !!id,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      articleData,
      isFormData,
    }: {
      articleData: Partial<Article>;
      isFormData?: boolean;
    }) => {
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : {};
      const { data } = await apiClient.post(API_URL, articleData, { headers });
      return data.data.article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.all });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updatedData,
      isFormData,
    }: {
      id: string;
      updatedData: Partial<Article>;
      isFormData?: boolean;
    }) => {
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : {};
      const { data } = await apiClient.patch(`${API_URL}/${id}`, updatedData, {
        headers,
      });
      return data.data.article;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.all });
      queryClient.invalidateQueries({
        queryKey: keys.knowledgeBase.detail(variables.id),
      });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`${API_URL}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.all });
    },
  });
};

export const useToggleArticleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ArticleBookmarkState,
    Error,
    { articleId: string; shouldBookmark: boolean }
  >({
    mutationFn: async ({ articleId, shouldBookmark }) => {
      const method = shouldBookmark ? "post" : "delete";
      const { data } = await apiClient[method](`${API_URL}/${articleId}/bookmark`);
      return data.data.bookmark;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.all });
      await queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.saved() });
      await queryClient.invalidateQueries({
        queryKey: keys.knowledgeBase.detail(variables.articleId),
      });
      await queryClient.invalidateQueries({ queryKey: keys.recommendations.all });
    },
  });
};

export const useUpdateArticleProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ArticleBookmarkState,
    Error,
    { articleId: string; progressPercent: number; isCompleted?: boolean }
  >({
    mutationFn: async ({ articleId, progressPercent, isCompleted }) => {
      const { data } = await apiClient.patch(`${API_URL}/${articleId}/progress`, {
        progressPercent,
        isCompleted,
      });
      return data.data.bookmark;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.all });
      await queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.saved() });
      await queryClient.invalidateQueries({
        queryKey: keys.knowledgeBase.detail(variables.articleId),
      });
    },
  });
};
