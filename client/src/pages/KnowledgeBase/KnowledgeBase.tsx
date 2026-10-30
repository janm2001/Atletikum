import { Alert, Button, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import QueryErrorMessage from "@/components/Common/QueryErrorMessage";
import KnowledgeBaseEmptyState from "@/components/KnowledgeBase/KnowledgeBaseEmptyState";
import KnowledgeBaseFilters from "@/components/KnowledgeBase/KnowledgeBaseFilters";

const KnowledgeBase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const audience = searchParams.get("publika") === "coaches" ? "coaches" : "children";
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [articleFilter, setArticleFilter] =
    useState<KnowledgeBaseArticleFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<KnowledgeBaseSortOption>("newest");

  const { data, isLoading, error } = useArticles({
    audience,
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
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.summary?.toLowerCase().includes(q),
        )
      : articles;

    if (q) return filtered;

    return [...filtered].sort((a, b) => {
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
        <Title order={1}>Učenje i blogovi</Title>
        <Text c="dimmed">Male lekcije za djecu. Više konteksta za odrasle koji ih prate.</Text>
        <Group role="group" aria-label="Publika sadržaja">
          <Button variant={audience === "children" ? "filled" : "light"} aria-pressed={audience === "children"} onClick={() => setSearchParams({})}>Za mlade sportaše</Button>
          <Button variant={audience === "coaches" ? "filled" : "light"} aria-pressed={audience === "coaches"} onClick={() => setSearchParams({ publika: "coaches" })}>Za roditelje i trenere</Button>
        </Group>
        {audience === "children" ? <Alert color="violet" title="Kreni od kratkih lekcija"><Stack><Text>Upoznaj pokret, provjeri što si naučio/la i vježbaj uz trenera.</Text><Button component={Link} to="/vjestine" variant="light">Otvori školu pokreta</Button></Stack></Alert> : <Alert color="orange" title="Trkačka edukacija za odrasle"><Stack><Text>Napredni primjeri opisuju trening iskusnih trkača. Nisu plan za djecu od 8 do 12 godina. Kviz provjerava razumijevanje članka, a ne spremnost za taj trening.</Text><Button component={Link} to="/zapis-treninga" variant="light" color="gray" w="fit-content">Postojeći dnevnik treninga</Button></Stack></Alert>}
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
