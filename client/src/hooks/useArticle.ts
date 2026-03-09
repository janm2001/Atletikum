import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keys } from "../lib/query-keys";
import { apiClient } from "../utils/apiService";
import type { Article, ArticleSummary } from "../types/Article/article";

const API_URL = "/articles";

export const useArticles = (tags?: string[]) => {
  return useQuery({
    queryKey:
      tags && tags.length > 0
        ? keys.knowledgeBase.categories(tags)
        : keys.knowledgeBase.all,
    queryFn: async (): Promise<ArticleSummary[]> => {
      const { data } = await apiClient.get(API_URL, {
        params: tags && tags.length > 0 ? { tag: tags } : {},
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
