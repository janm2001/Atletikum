import {
  Card,
  SimpleGrid,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ArticleSummary } from "@/types/Article/article";
import { gradients } from "@/styles/colors";
import { ArticleThumb } from "./DashboardArticleThumb";

interface DashboardRecommendedContentProps {
  articles: ArticleSummary[];
  onNavigate: (id: string) => void;
}

const DashboardRecommendedContent = ({
  articles,
  onNavigate,
}: DashboardRecommendedContentProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const mode = computedColorScheme === "dark" ? "dark" : "light";
  const stitch = theme.other.stitch[mode];

  if (!articles?.length) return null;

  return (
    <Card
      p="md"
      style={{
        background: mode === "dark" ? gradients.cardDarkAlt : undefined,
      }}
    >
      <Text size="xs" tt="uppercase" fw={700} c={stitch.textMuted} mb="sm">
        {t("dashboard.recommendedContent.title")}
      </Text>

      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing={10}>
        {articles.slice(0, 2).map((article) => (
          <ArticleThumb
            key={article._id}
            article={article}
            onNavigate={onNavigate}
            mutedText={stitch.textMuted}
            surfaceColor={stitch.surfaceInteractive}
            borderColor={stitch.borderSubtle}
          />
        ))}
      </SimpleGrid>
    </Card>
  );
};

export default DashboardRecommendedContent;
