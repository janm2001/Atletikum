import {
  Container,
  Group,
  Title,
  Text,
  SimpleGrid,
  MultiSelect,
  Center,
} from "@mantine/core";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useArticles } from "../../hooks/useArticle";
import { useMyQuizCompletions } from "../../hooks/useQuiz";
import { ArticleTag, ARTICLE_TAG_LABELS } from "../../types/Article/article";
import type { ArticleTagType } from "../../types/Article/article";
import { IconBook } from "@tabler/icons-react";
import { ArticleCard } from "../../components/KnowledgeBase/ArticleCard";
import { XpProgressSection } from "../../components/XpProgress/XpProgressSection";

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data, isLoading } = useArticles(
    selectedTags.length > 0 ? selectedTags : undefined,
  );
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

        <MultiSelect
          placeholder="Sve kategorije"
          value={selectedTags}
          onChange={setSelectedTags}
          data={Object.values(ArticleTag).map((tag) => ({
            value: tag,
            label: ARTICLE_TAG_LABELS[tag as ArticleTagType],
          }))}
          clearable
          searchable
          w={250}
        />
      </Group>

      <XpProgressSection variant="brain" />

      {isLoading ? (
        <SpinnerComponent size="lg" fullHeight={false} />
      ) : articles?.length === 0 ? (
        <Center py="xl" style={{ flexDirection: "column", gap: 10 }}>
          <IconBook size={48} color="gray" />
          <Text c="dimmed">Nema pronađenih članaka za ovu kategoriju.</Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" my={16}>
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
