import { SimpleGrid } from "@mantine/core";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import type { ArticleSummary } from "@/types/Article/article";
import DashboardSectionHeader from "./DashboardSectionHeader";
import { ArticleCard } from "../KnowledgeBase/Article/ArticleCard";

interface DashboardArticlesSectionProps {
  articles: ArticleSummary[];
  isLoading: boolean;
  completedArticleIds: Set<string>;
  onNavigateArticle: (id: string) => void;
  onOpenArticles: () => void;
  onToggleBookmark: (article: ArticleSummary) => void;
}

const DashboardArticlesSection = ({
  articles,
  isLoading,
  completedArticleIds,
  onNavigateArticle,
  onOpenArticles,
  onToggleBookmark,
}: DashboardArticlesSectionProps) => {
  return (
    <div>
      <DashboardSectionHeader
        title="Preporučeni članci"
        actionLabel="Svi članci"
        onAction={onOpenArticles}
      />

      {isLoading ? (
        <SpinnerComponent size="md" fullHeight={false} />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {articles.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              isQuizCompleted={completedArticleIds.has(article._id)}
              onNavigate={onNavigateArticle}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </SimpleGrid>
      )}
    </div>
  );
};

export default DashboardArticlesSection;
