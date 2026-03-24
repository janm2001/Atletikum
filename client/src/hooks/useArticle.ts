import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  createArticle,
  deleteArticle,
  getArticleDetail,
  getArticles,
  toggleArticleBookmark,
  updateArticle,
  updateArticleProgress,
} from "@/api/articles";
import {
  removeArticleFromDetailCache,
  removeCachedEntity,
  updateArticleBookmarkInDetail,
  updateArticleBookmarkInList,
} from "@/lib/query-cache";
import { keys } from "../lib/query-keys";
import type {
  Article,
  ArticleBookmarkState,
  ArticleSummary,
} from "../types/Article/article";
import type { WeeklyRecommendations } from "@/types/Recommendation/recommendation";

const isSavedArticleListKey = (queryKey: readonly unknown[]) =>
  queryKey[0] === keys.knowledgeBase.all[0] &&
  queryKey[1] === "list" &&
  queryKey[2] === "saved";

const syncArticleBookmarkState = (
  queryClient: QueryClient,
  articleId: string,
  bookmark: ArticleBookmarkState,
  options?: { removeFromSavedLists?: boolean },
) => {
  for (const [queryKey] of queryClient.getQueriesData<ArticleSummary[]>({
    queryKey: keys.knowledgeBase.lists(),
  })) {
    queryClient.setQueryData<ArticleSummary[] | undefined>(queryKey, (articles) =>
      updateArticleBookmarkInList(
        articles,
        articleId,
        bookmark,
        options?.removeFromSavedLists && isSavedArticleListKey(queryKey)
          ? { remove: true }
          : undefined,
      ),
    );
  }

  queryClient.setQueriesData<Article | undefined>(
    { queryKey: keys.knowledgeBase.details() },
    (article) => updateArticleBookmarkInDetail(article, articleId, bookmark),
  );

  queryClient.setQueryData<WeeklyRecommendations | undefined>(
    keys.recommendations.weekly(),
    (recommendations) => {
      if (!recommendations) {
        return recommendations;
      }

      return {
        ...recommendations,
        articles:
          updateArticleBookmarkInList(
            recommendations.articles,
            articleId,
            bookmark,
          ) ?? recommendations.articles,
      };
    },
  );
};

export const useArticles = (options?: { tags?: string[]; savedOnly?: boolean; q?: string }) => {
  const tags = options?.tags;
  const savedOnly = options?.savedOnly ?? false;
  const q = options?.q?.trim() ?? "";

  const baseKey = savedOnly
    ? keys.knowledgeBase.saved(tags)
    : tags && tags.length > 0
      ? keys.knowledgeBase.categories(tags)
      : keys.knowledgeBase.list();

  const effectiveKey = q ? [...baseKey, "search", q] : baseKey;

  return useQuery({
    queryKey: effectiveKey,
    queryFn: () => getArticles({ tags, savedOnly, q: q || undefined }),
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.lists() }),
        queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.details() }),
      ]);
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateArticle,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.lists() }),
        queryClient.invalidateQueries({ queryKey: keys.knowledgeBase.details() }),
      ]);
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: async (_, articleId) => {
      queryClient.setQueriesData<ArticleSummary[] | undefined>(
        { queryKey: keys.knowledgeBase.lists() },
        (articles) => removeCachedEntity(articles, articleId),
      );
      queryClient.setQueriesData<Article | undefined>(
        { queryKey: keys.knowledgeBase.details() },
        (article) => removeArticleFromDetailCache(article, articleId),
      );
      await queryClient.invalidateQueries({
        queryKey: keys.knowledgeBase.details(),
      });
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
    onSuccess: async (bookmark, variables) => {
      syncArticleBookmarkState(queryClient, variables.articleId, bookmark, {
        removeFromSavedLists: !bookmark.isBookmarked,
      });
      await queryClient.invalidateQueries({
        queryKey: keys.knowledgeBase.saved(),
      });
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
    onSuccess: (bookmark, variables) => {
      syncArticleBookmarkState(queryClient, variables.articleId, bookmark);
      if (variables.isCompleted) {
        queryClient.invalidateQueries({
          queryKey: keys.challenges.weekly(),
        });
      }
    },
  });
};
