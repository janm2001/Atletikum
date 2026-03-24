import {
  Card,
  Image,
  Badge,
  Group,
  Button,
  Text,
  ActionIcon,
} from "@mantine/core";
import {
  IconCheck,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react";
import type { ArticleSummary, ArticleTagType } from "@/types/Article/article";
import { getArticleTagLabel } from "@/types/Article/article";
import { useTranslation } from "react-i18next";
import { resolveArticleCoverImageUrl } from "@/utils/articleCoverImage";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=2970&ixlib=rb-4.0.3";

const tagColors: Record<ArticleTagType, string> = {
  TRAINING: "blue",
  NUTRITION: "green",
  RECOVERY: "teal",
  PHYSIOLOGY: "red",
  PSYCHOLOGY: "violet",
  BIOMECHANICS: "orange",
  PERIODIZATION: "grape",
};

interface ArticleCardProps {
  article: ArticleSummary;
  isQuizCompleted?: boolean;
  onNavigate: (id: string) => void;
  onToggleBookmark?: (article: ArticleSummary) => void;
}

export const ArticleCard = ({
  article,
  isQuizCompleted,
  onNavigate,
  onToggleBookmark,
}: ArticleCardProps) => {
  const { t } = useTranslation();

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      display="flex"
      style={{ flexDirection: "column", height: "100%" }}
    >
      <Card.Section>
        <Image
          src={resolveArticleCoverImageUrl(article.coverImage) || FALLBACK_IMAGE}
          height={160}
          alt={article.title}
          fit="cover"
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Group gap="xs">
          <Badge color={tagColors[article.tag] || "blue"} variant="light">
            {getArticleTagLabel(article.tag)}
          </Badge>
          {isQuizCompleted && (
            <Badge
              color="teal"
              variant="light"
              leftSection={<IconCheck size={12} />}
            >
              {t('articles.card.quizBadge')}
            </Badge>
          )}
          {article.bookmark?.isCompleted && (
            <Badge color="grape" variant="light">
              {t('articles.card.readBadge')}
            </Badge>
          )}
          {article.bookmark &&
            article.bookmark.progressPercent > 0 &&
            !article.bookmark.isCompleted && (
              <Badge color="gray" variant="light">
                {article.bookmark.progressPercent}%
              </Badge>
            )}
        </Group>
        <Group gap="xs">
          {onToggleBookmark && (
            <ActionIcon
              variant="subtle"
              color={article.bookmark?.isBookmarked ? "grape" : "gray"}
              onClick={() => onToggleBookmark(article)}
              aria-label={article.bookmark?.isBookmarked ? t('articles.card.removeBookmark') : t('articles.card.addBookmark')}
            >
              {article.bookmark?.isBookmarked ? (
                <IconBookmarkFilled size={16} />
              ) : (
                <IconBookmark size={16} />
              )}
            </ActionIcon>
          )}
          <Text size="xs" c="var(--app-text-muted)">
            {new Date(article.createdAt).toLocaleDateString("hr-HR")}
          </Text>
        </Group>
      </Group>

      <Text fw={500} size="lg" mt="md" lineClamp={2}>
        {article.title}
      </Text>

      <Text size="sm" c="var(--app-text-muted)" mt="sm" lineClamp={3} style={{ flex: 1 }}>
        {article.summary}
      </Text>

      <Button
        variant="light"
        fullWidth
        mt="md"
        radius="md"
        onClick={() => onNavigate(article._id)}
      >
        {t('articles.card.readMore')}
      </Button>
    </Card>
  );
};
