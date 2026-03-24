import {
  ActionIcon,
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Group,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface ArticleDetailHeaderProps {
  title: string;
  tag: string;
  author: string;
  createdAt: string;
  progressPercent: number;
  isBookmarked: boolean;
  onBack: () => void;
  onToggleBookmark: () => void;
}

const ArticleDetailHeader = ({
  title,
  tag,
  author,
  createdAt,
  progressPercent,
  isBookmarked,
  onBack,
  onToggleBookmark,
}: ArticleDetailHeaderProps) => {
  const { t } = useTranslation();

  const breadcrumbs = [
    <Anchor key="knowledge-base" onClick={onBack} c="var(--app-text-muted)">
      {t('articles.breadcrumb')}
    </Anchor>,
    <Text key="title" truncate w={200}>
      {title}
    </Text>,
  ];

  return (
    <>
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={onBack}
        mb="md"
      >
        {t('articles.backButton')}
      </Button>

      <Breadcrumbs mb="xl">{breadcrumbs}</Breadcrumbs>

      <Badge size="lg" mb="sm" variant="light" color="violet">
        {tag}
      </Badge>

      <Group justify="space-between" align="flex-start" gap="sm">
        <Title order={1} mb="xs" style={{ lineHeight: 1.3 }}>
          {title}
        </Title>
        <ActionIcon
          variant="light"
          color={isBookmarked ? "grape" : "gray"}
          size="lg"
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? t('articles.removeBookmark') : t('articles.addBookmark')}
        >
          {isBookmarked ? (
            <IconBookmarkFilled size={18} />
          ) : (
            <IconBookmark size={18} />
          )}
        </ActionIcon>
      </Group>

      <Group mb="xl">
        <Text size="sm" c="var(--app-text-muted)">{t('articles.authorLabel')}{author}</Text>
        <Text size="sm" c="var(--app-text-muted)">•</Text>
        <Text size="sm" c="var(--app-text-muted)">{new Date(createdAt).toLocaleDateString("hr-HR")}</Text>
        <Text size="sm" c="var(--app-text-muted)">•</Text>
        <Text size="sm" c="var(--app-text-muted)">{t('articles.progressLabel')}{progressPercent}%</Text>
      </Group>
    </>
  );
};

export default ArticleDetailHeader;
