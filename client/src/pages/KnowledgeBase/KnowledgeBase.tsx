import { Container, SimpleGrid, Stack } from "@mantine/core";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useArticles, useToggleArticleBookmark } from "../../hooks/useArticle";
import { useMyQuizCompletions } from "@/hooks/useQuiz";
import { type ArticleSummary } from "@/types/Article/article";
import type {
  KnowledgeBaseArticleFilter,
  KnowledgeBaseSortOption,
} from "@/types/Article/knowledgeBase";
import { ArticleCard } from "@/components/KnowledgeBase/Article/ArticleCard";
import { XpProgressSection } from "@/components/XpProgress/XpProgressSection";
import QueryErrorMessage from "@/components/Common/QueryErrorMessage";
import KnowledgeBaseEmptyState from "@/components/KnowledgeBase/KnowledgeBaseEmptyState";
import KnowledgeBaseFilters from "@/components/KnowledgeBase/KnowledgeBaseFilters";
import KnowledgeBaseHeader from "@/components/KnowledgeBase/KnowledgeBaseHeader";
import DashboardRevisionCard from "@/components/Dashboard/DashboardRevisionCard";
import { useWeeklyRecommendations } from "@/hooks/useRecommendations";

const KnowledgeBase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [articleFilter, setArticleFilter] =
    useState<KnowledgeBaseArticleFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<KnowledgeBaseSortOption>("newest");

  const { data: recommendations } = useWeeklyRecommendations();
  const { data, isLoading, error } = useArticles({
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    savedOnly: articleFilter === "saved",
  });
  const { data: completedArticleIds } = useMyQuizCompletions();
  const toggleBookmarkMutation = useToggleArticleBookmark();

  const articles = useMemo(() => data ?? [], [data]);
  const completedSet = useMemo(
    () => new Set(completedArticleIds ?? []),
    [completedArticleIds],
  );

  const filteredAndSortedArticles = useMemo(() => {
    let result = articles;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          (article.summary ?? "").toLowerCase().includes(query),
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return a.title.localeCompare(b.title, "hr");
    });

    return result;
  }, [articles, searchQuery, sortBy]);

  const handleToggleBookmark = (article: ArticleSummary) => {
    toggleBookmarkMutation.mutate({
      articleId: article._id,
      shouldBookmark: !article.bookmark?.isBookmarked,
    });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="md">
        <KnowledgeBaseHeader />
        <XpProgressSection variant="brain" />
        <KnowledgeBaseFilters
          articleFilter={articleFilter}
          onArticleFilterChange={setArticleFilter}
          selectedTags={selectedTags}
          onSelectedTagsChange={setSelectedTags}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
        <DashboardRevisionCard
          revision={recommendations?.revision}
          onStartRevision={(articleId) =>
            navigate(`/edukacija/${articleId}/kviz`)
          }
        />
        {isLoading ? (
          <SpinnerComponent size="lg" fullHeight={false} />
        ) : error ? (
          <QueryErrorMessage message={t("knowledgeBase.error")} />
        ) : filteredAndSortedArticles.length === 0 ? (
          <KnowledgeBaseEmptyState />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {filteredAndSortedArticles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                isQuizCompleted={completedSet.has(article._id)}
                onNavigate={(id) => navigate(`/edukacija/${id}`)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};

export default KnowledgeBase;
