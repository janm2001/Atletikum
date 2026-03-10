import { Text, Title } from "@mantine/core";

const KnowledgeBaseHeader = () => {
  return (
    <div>
      <Title order={1} mb="xs">
        Baza Znanja
      </Title>
      <Text c="dimmed">
        Edukativni članci i istraživanja za poboljšanje vaših performansi
      </Text>
    </div>
  );
};

export default KnowledgeBaseHeader;
