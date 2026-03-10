import { Paper, Stack, Text, Title } from "@mantine/core";

interface ArticleActionSummaryProps {
  items?: string[];
}

const ArticleActionSummary = ({ items }: ArticleActionSummaryProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Paper my="xl" p="md" withBorder radius="md">
      <Title order={4} mb="sm">
        Primijeni odmah
      </Title>
      <Stack gap="xs">
        {items.map((item, index) => (
          <Text key={`${item}-${index}`} size="sm">
            {index + 1}. {item}
          </Text>
        ))}
      </Stack>
    </Paper>
  );
};

export default ArticleActionSummary;
