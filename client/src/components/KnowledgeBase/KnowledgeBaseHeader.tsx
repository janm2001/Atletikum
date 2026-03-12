import { Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

const KnowledgeBaseHeader = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Title order={1} mb="xs">
        {t('knowledgeBase.header.title')}
      </Title>
      <Text c="dimmed">
        {t('knowledgeBase.header.subtitle')}
      </Text>
    </div>
  );
};

export default KnowledgeBaseHeader;
