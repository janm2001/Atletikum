import { Card, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface ArticleActionSummaryProps {
  items?: string[];
}

const ArticleActionSummary = ({ items }: ArticleActionSummaryProps) => {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Card my="xl" p="md" withBorder radius="md" shadow="sm">
      <Title order={4} mb="sm">
        {t('articles.actionSummary')}
      </Title>
      <Stack gap="xs">
        {items.map((item, index) => (
          <Text key={`${item}-${index}`} size="sm">
            {index + 1}. {item}
          </Text>
        ))}
      </Stack>
    </Card>
  );
};

export default ArticleActionSummary;
