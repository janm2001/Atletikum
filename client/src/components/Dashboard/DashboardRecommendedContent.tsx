import { Anchor, Badge, Box, Card, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { ArticleSummary } from "@/types/Article/article";
import { getArticleTagLabel } from "@/types/Article/article";

interface DashboardRecommendedContentProps {
  articles: ArticleSummary[];
  onNavigate: (id: string) => void;
}

const FALLBACK_BG =
  "linear-gradient(135deg, var(--mantine-color-violet-8) 0%, var(--mantine-color-grape-8) 100%)";

const ArticleThumb = ({
  article,
  onNavigate,
}: {
  article: ArticleSummary;
  onNavigate: (id: string) => void;
}) => (
  <Box
    style={{
      display: "flex",
      gap: 12,
      cursor: "pointer",
      alignItems: "center",
    }}
    onClick={() => onNavigate(article._id)}
  >
    {/* Square thumbnail */}
    <Box
      style={{
        width: 64,
        height: 64,
        flexShrink: 0,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {article.coverImage ? (
        <Box
          component="img"
          src={article.coverImage}
          alt={article.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      ) : (
        <Box
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: FALLBACK_BG,
          }}
        />
      )}
    </Box>

    {/* Text */}
    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
      <Text size="sm" fw={600} lineClamp={2} lh={1.3}>
        {article.title}
      </Text>
      <Badge size="xs" variant="light" color="violet" w="fit-content">
        {getArticleTagLabel(article.tag)}
      </Badge>
    </Stack>
  </Box>
);

const DashboardRecommendedContent = ({
  articles,
  onNavigate,
}: DashboardRecommendedContentProps) => {
  const { t } = useTranslation();

  if (!articles?.length) return null;

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Text size="sm" tt="uppercase" fw={600} c="dimmed" mb="sm">
        {t("dashboard.recommendedContent.title")}
      </Text>

      <Stack gap="md">
        {articles.slice(0, 2).map((article) => (
          <ArticleThumb
            key={article._id}
            article={article}
            onNavigate={onNavigate}
          />
        ))}
      </Stack>

      <Anchor
        component={Link}
        to="/edukacija"
        size="xs"
        c="dimmed"
        mt="sm"
        display="block"
      >
        {t("dashboard.recommendedContent.viewAll")}
      </Anchor>
    </Card>
  );
};

export default DashboardRecommendedContent;
