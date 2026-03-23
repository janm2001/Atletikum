import { Card, SimpleGrid, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ArticleSummary } from "@/types/Article/article";
import { ArticleThumb } from "./DashboardArticleThumb";
import classes from "./DashboardRecommendedContent.module.css";

interface DashboardRecommendedContentProps {
  articles: ArticleSummary[];
  onNavigate: (id: string) => void;
}

const DashboardRecommendedContent = ({
  articles,
  onNavigate,
}: DashboardRecommendedContentProps) => {
  const { t } = useTranslation();

  if (!articles?.length) return null;

  return (
    <Card p="md" className={classes.card}>
      <Text size="xs" tt="uppercase" fw={700} c="var(--app-text-muted)" mb="sm">
        {t("dashboard.recommendedContent.title")}
      </Text>

      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing={10}>
        {articles.slice(0, 2).map((article) => (
          <ArticleThumb
            key={article._id}
            article={article}
            onNavigate={onNavigate}
          />
        ))}
      </SimpleGrid>
    </Card>
  );
};

export default DashboardRecommendedContent;
