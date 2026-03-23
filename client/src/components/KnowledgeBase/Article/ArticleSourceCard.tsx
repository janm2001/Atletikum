import { Button, Card, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface ArticleSourceCardProps {
  sourceUrl?: string;
  sourceTitle?: string;
}

const ArticleSourceCard = ({
  sourceUrl,
  sourceTitle,
}: ArticleSourceCardProps) => {
  const { t } = useTranslation();

  if (!sourceUrl) {
    return null;
  }

  return (
    <Card my="xl" p="md" withBorder radius="md" shadow="sm">
      <Text fw={600} mb="xs">
        {t('articles.sourceHeader')}
      </Text>
      <Button
        component="a"
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="default"
        rightSection={<IconExternalLink size={16} />}
        style={{ maxWidth: "100%" }}
        styles={{ label: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 } }}
      >
        {sourceTitle || t('articles.readSource')}
      </Button>
    </Card>
  );
};

export default ArticleSourceCard;
