import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Group,
  Button,
  Select,
  Loader,
  Center,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useArticles } from "../../hooks/useArticle";
import { ArticleTag } from "../../types/Article/article";
import { IconBook } from "@tabler/icons-react";

const tagColors: Record<string, string> = {
  TRAINING: "blue",
  NUTRITION: "green",
  RECOVERY: "teal",
  PHYSIOLOGY: "red",
  PSYCHOLOGY: "violet",
  BIOMECHANICS: "orange",
  PERIODIZATION: "grape",
};

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { data, isLoading } = useArticles(selectedTag || undefined);
  console.log(data);
  const articles = useMemo(() => data ?? [], [data]);

  console.log("Articles", articles);

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
            <Card
              key={article._id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              display="flex"
              style={{ flexDirection: "column", height: "100%" }}
            >
              <Card.Section>
                <Image
                  src={
                    article.coverImage ||
                    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=2970&ixlib=rb-4.0.3"
                  }
                  height={160}
                  alt={article.title}
                />
              </Card.Section>

              <Group justify="space-between" mt="md" mb="xs">
                <Badge color={tagColors[article.tag] || "blue"} variant="light">
                  {article.tag}
                </Badge>
                <Text size="xs" c="dimmed">
                  {new Date(article.createdAt).toLocaleDateString("hr-HR")}
                </Text>
              </Group>

              <Text fw={500} size="lg" mt="md" lineClamp={2}>
                {article.title}
              </Text>

              <Text
                size="sm"
                c="dimmed"
                mt="sm"
                lineClamp={3}
                style={{ flex: 1 }}
              >
                {article.summary}
              </Text>

              <Button
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
                onClick={() => navigate(`/edukacija/${article._id}`)}
              >
                Pročitaj više
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default KnowledgeBase;
