import {
  Container,
  Group,
  Title,
  Text,
  SimpleGrid,
  Select,
  Loader,
  Center,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useArticles } from "../../hooks/useArticle";
import { useMyQuizCompletions } from "../../hooks/useQuiz";
import { ArticleTag } from "../../types/Article/article";
import { IconBook } from "@tabler/icons-react";
import { ArticleCard } from "../../components/KnowledgeBase/ArticleCard";
import { XpProgressSection } from "../../components/XpProgress/XpProgressSection";

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { data, isLoading } = useArticles(selectedTag || undefined);
  const { data: completedArticleIds } = useMyQuizCompletions();
  const articles = useMemo(() => data ?? [], [data]);
  const completedSet = useMemo(
    () => new Set(completedArticleIds ?? []),
    [completedArticleIds],
  );

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" align="flex-end" mb="xl">
        <div>
          <Title order={1} mb="xs">
            Baza Znanja
          </Title>
          <Text c="dimmed">
            Edukativni članci i istraživanja za poboljšanje vaših performansi
          </Text>
        </div>

        <Select
          placeholder="Sve kategorije"
          value={selectedTag}
          onChange={setSelectedTag}
          data={[
            { value: "", label: "Sve kategorije" },
            ...Object.values(ArticleTag).map((tag) => ({
              value: tag,
              label: tag,
            })),
          ]}
          clearable
          w={200}
        />
      </Group>

      <XpProgressSection variant="brain" />

      {isLoading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : articles?.length === 0 ? (
        <Center py="xl" style={{ flexDirection: "column", gap: 10 }}>
          <IconBook size={48} color="gray" />
          <Text c="dimmed">Nema pronađenih članaka za ovu kategoriju.</Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {articles?.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              isQuizCompleted={completedSet.has(article._id)}
              onNavigate={(id) => navigate(`/edukacija/${id}`)}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default KnowledgeBase;
