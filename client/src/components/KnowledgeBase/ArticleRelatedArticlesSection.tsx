import { Divider, SimpleGrid } from "@mantine/core";
import { ArticleCard } from "@/components/KnowledgeBase/ArticleCard";
import type { ArticleSummary } from "@/types/Article/article";

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
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <>
      <Divider my="xl" label="Povezani članci" labelPosition="center" />
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
    </>
  );
};

export default ArticleRelatedArticlesSection;
