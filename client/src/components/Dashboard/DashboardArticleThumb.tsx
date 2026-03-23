import { Badge, Box, Stack, Text } from "@mantine/core";
import type { ArticleSummary } from "@/types/Article/article";
import { getArticleTagLabel } from "@/types/Article/article";
import { gradients } from "@/styles/colors";

interface ArticleThumbProps {
  article: ArticleSummary;
  onNavigate: (id: string) => void;
  mutedText: string;
  surfaceColor: string;
  borderColor: string;
}

export const ArticleThumb = ({
  article,
  onNavigate,
  mutedText,
  surfaceColor,
  borderColor,
}: ArticleThumbProps) => {
  const handleActivate = () => onNavigate(article._id);

  return (
    <Box
      style={{
        cursor: "pointer",
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: surfaceColor,
      }}
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
      <Box
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
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
              backgroundImage: gradients.fallbackImage,
            }}
          />
        )}
      </Box>

      <Stack gap={6} p="sm">
        <Text
          size="sm"
          fw={600}
          lineClamp={2}
          lh={1.35}
          style={{ minWidth: 0 }}
        >
          {article.title}
        </Text>
        <Badge size="xs" variant="light" color="stitch" w="fit-content">
          {getArticleTagLabel(article.tag)}
        </Badge>
        <Text size="xs" c={mutedText} lineClamp={2}>
          {article.summary}
        </Text>
      </Stack>
    </Box>
  );
};
