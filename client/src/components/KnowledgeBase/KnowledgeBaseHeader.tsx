import { Card, Group, Text, Title } from "@mantine/core";
import { IconBooks } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const KnowledgeBaseHeader = () => {
  const { t } = useTranslation();

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Group gap="md" align="center">
        <IconBooks size={40} stroke={1.5} color="var(--mantine-color-violet-6)" />
        <div>
          <Title order={2} mb={4}>
            {t("knowledgeBase.header.title")}
          </Title>
          <Text size="sm" c="var(--app-text-muted)">
            {t("knowledgeBase.header.subtitle")}
          </Text>
        </div>
      </Group>
    </Card>
  );
};

export default KnowledgeBaseHeader;
