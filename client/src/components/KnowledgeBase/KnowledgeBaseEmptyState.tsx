import { Center, Text } from "@mantine/core";
import { IconBook } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const KnowledgeBaseEmptyState = () => {
  const { t } = useTranslation();

  return (
    <Center py="xl" style={{ flexDirection: "column", gap: 10 }}>
      <IconBook size={48} color="gray" />
      <Text c="var(--app-text-muted)">{t("knowledgeBase.empty")}</Text>
    </Center>
  );
};

export default KnowledgeBaseEmptyState;
