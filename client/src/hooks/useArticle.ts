import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createArticle,
  deleteArticle,
  getArticleDetail,
  getArticles,
  toggleArticleBookmark,
  updateArticle,
  updateArticleProgress,
} from "@/api/articles";
import { keys } from "../lib/query-keys";
import type { ArticleBookmarkState } from "../types/Article/article";

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
    queryFn: () => getArticles({ tags, savedOnly }),
  });
};

export const useArticleDetail = (id: string) => {
  return useQuery({
    queryKey: keys.knowledgeBase.detail(id),
    queryFn: () => getArticleDetail(id),
    enabled: !!id,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.all });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateArticle,
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
    mutationFn: deleteArticle,
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
    mutationFn: toggleArticleBookmark,
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
    mutationFn: updateArticleProgress,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.all });
      await queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.saved() });
      await queryClient.invalidateQueries({
        queryKey: keys.knowledgeBase.detail(variables.articleId),
      });
    },
  });
};
