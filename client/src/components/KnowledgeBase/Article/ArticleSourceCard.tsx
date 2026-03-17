import { Button, Paper, Text } from "@mantine/core";
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
    <Paper my="xl" p="md" withBorder radius="md" bg="dark.7">
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
    </Paper>
  );
};

export default ArticleSourceCard;
