import { Container, Group, SimpleGrid } from "@mantine/core";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useArticles, useToggleArticleBookmark } from "../../hooks/useArticle";
import { useMyQuizCompletions } from "@/hooks/useQuiz";
import { type ArticleSummary } from "@/types/Article/article";
import type { KnowledgeBaseArticleFilter } from "@/types/Article/knowledgeBase";
import { ArticleCard } from "@/components/KnowledgeBase/Article/ArticleCard";
import { XpProgressSection } from "@/components/XpProgress/XpProgressSection";
import QueryErrorMessage from "@/components/Common/QueryErrorMessage";
import KnowledgeBaseEmptyState from "@/components/KnowledgeBase/KnowledgeBaseEmptyState";
import KnowledgeBaseFilters from "@/components/KnowledgeBase/KnowledgeBaseFilters";
import KnowledgeBaseHeader from "@/components/KnowledgeBase/KnowledgeBaseHeader";

const KnowledgeBase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [articleFilter, setArticleFilter] =
    useState<KnowledgeBaseArticleFilter>("all");
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

  const handleToggleBookmark = (article: ArticleSummary) => {
    toggleBookmarkMutation.mutate({
      articleId: article._id,
      shouldBookmark: !article.bookmark?.isBookmarked,
    });
  };

  return (
    <Container size="xl" py="xl">
      <Group
        justify="space-between"
        align="flex-end"
        mb="xl"
        wrap="wrap"
        gap="sm"
      >
        <KnowledgeBaseHeader />

        <KnowledgeBaseFilters
          articleFilter={articleFilter}
          onArticleFilterChange={setArticleFilter}
          selectedTags={selectedTags}
          onSelectedTagsChange={setSelectedTags}
        />
      </Group>

      <XpProgressSection variant="brain" />

      {isLoading ? (
        <SpinnerComponent size="lg" fullHeight={false} />
      ) : error ? (
        <QueryErrorMessage message={t("knowledgeBase.error")} />
      ) : articles?.length === 0 ? (
        <KnowledgeBaseEmptyState />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" my={16}>
          {articles?.map((article) => (
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
    </Container>
  );
};

export default KnowledgeBase;
