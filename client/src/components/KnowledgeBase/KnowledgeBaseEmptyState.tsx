import { Center, Text } from "@mantine/core";
import { IconBook } from "@tabler/icons-react";

const KnowledgeBaseEmptyState = () => {
  return (
    <Center py="xl" style={{ flexDirection: "column", gap: 10 }}>
      <IconBook size={48} color="gray" />
      <Text c="dimmed">Nema pronađenih članaka za ovu kategoriju.</Text>
    </Center>
  );
};

export default KnowledgeBaseEmptyState;
