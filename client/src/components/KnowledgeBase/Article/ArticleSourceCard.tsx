import { Button, Paper, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";

interface ArticleSourceCardProps {
  sourceUrl?: string;
  sourceTitle?: string;
}

const ArticleSourceCard = ({
  sourceUrl,
  sourceTitle,
}: ArticleSourceCardProps) => {
  if (!sourceUrl) {
    return null;
  }

  return (
    <Paper my="xl" p="md" withBorder radius="md" bg="dark.7">
      <Text fw={600} mb="xs">
        Izvori i znanstvena istraživanja:
      </Text>
      <Button
        component="a"
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="default"
        rightSection={<IconExternalLink size={16} />}
      >
        {sourceTitle || "Pročitaj izvorno istraživanje"}
      </Button>
    </Paper>
  );
};

export default ArticleSourceCard;
