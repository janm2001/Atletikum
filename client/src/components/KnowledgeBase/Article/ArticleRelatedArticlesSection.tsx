import { SimpleGrid, Stack, Text } from "@mantine/core";
import type { ArticleSummary } from "@/types/Article/article";
import { ArticleCard } from "./ArticleCard";
import { useTranslation } from "react-i18next";

interface ArticleRelatedArticlesSectionProps {
  articles?: ArticleSummary[];
  onNavigateArticle: (id: string) => void;
  onToggleBookmark: (article: ArticleSummary) => void;
}

const ArticleRelatedArticlesSection = ({
  articles,
  onNavigateArticle,
  onToggleBookmark,
}: ArticleRelatedArticlesSectionProps) => {
  const { t } = useTranslation();

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <Stack gap="md" mt="xl">
      <Text size="xs" tt="uppercase" fw={700} c="var(--app-text-muted)" mb="sm">
        {t('articles.relatedArticles')}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {articles.map((article) => (
          <ArticleCard
            key={article._id}
            article={article}
            onNavigate={onNavigateArticle}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default ArticleRelatedArticlesSection;
