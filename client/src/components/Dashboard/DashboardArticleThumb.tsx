import { Badge, Box, Stack, Text } from "@mantine/core";
import type { ArticleSummary } from "@/types/Article/article";
import { getArticleTagLabel } from "@/types/Article/article";
import classes from "./DashboardArticleThumb.module.css";

interface ArticleThumbProps {
  article: ArticleSummary;
  onNavigate: (id: string) => void;
}

export const ArticleThumb = ({ article, onNavigate }: ArticleThumbProps) => {
  const handleActivate = () => onNavigate(article._id);

  return (
    <Box
      className={classes.thumb}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleActivate();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Box className={classes.imageWrapper}>
        {article.coverImage ? (
          <Box
            component="img"
            src={article.coverImage}
            alt={article.title}
            className={classes.image}
          />
        ) : (
          <Box className={classes.fallback} />
        )}
      </Box>

      <Stack gap={6} p="sm">
        <Text
          size="sm"
          fw={600}
          lineClamp={2}
          lh={1.35}
          className={classes.title}
        >
          {article.title}
        </Text>
        <Badge size="xs" variant="light" color="stitch" w="fit-content">
          {getArticleTagLabel(article.tag)}
        </Badge>
        <Text size="xs" c="var(--app-text-muted)" lineClamp={2}>
          {article.summary}
        </Text>
      </Stack>
    </Box>
  );
};
