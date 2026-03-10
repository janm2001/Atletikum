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
  const breadcrumbs = [
    <Anchor key="knowledge-base" onClick={onBack} c="dimmed">
      Baza Znanja
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
        Nazad na Bazu Znanja
      </Button>

      <Breadcrumbs mb="xl">{breadcrumbs}</Breadcrumbs>

      <Badge size="lg" mb="sm" variant="light" color="blue">
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
        >
          {isBookmarked ? (
            <IconBookmarkFilled size={18} />
          ) : (
            <IconBookmark size={18} />
          )}
        </ActionIcon>
      </Group>

      <Group mb="xl" c="dimmed">
        <Text size="sm">Autor: {author}</Text>
        <Text size="sm">•</Text>
        <Text size="sm">{new Date(createdAt).toLocaleDateString("hr-HR")}</Text>
        <Text size="sm">•</Text>
        <Text size="sm">Napredak: {progressPercent}%</Text>
      </Group>
    </>
  );
};

export default ArticleDetailHeader;
