import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Image,
  Badge,
  Group,
  Button,
  Center,
  Breadcrumbs,
  Anchor,
  TypographyStylesProvider,
  Paper,
  Divider,
} from "@mantine/core";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import {
  IconArrowLeft,
  IconExternalLink,
  IconBrain,
} from "@tabler/icons-react";
import { useArticleDetail } from "../../hooks/useArticle";
import { XpNotification } from "../../components/XpNotification/XpNotification";

type ArticleDetailLocationState = {
  quizResult?: {
    xpGained: number;
    score: number;
    totalQuestions: number;
    level?: number;
    totalXp?: number;
  };
} | null;

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: article, isLoading, error } = useArticleDetail(id!);

  const locationState = location.state as ArticleDetailLocationState;
  const [quizResult, setQuizResult] = useState(
    locationState?.quizResult ?? null,
  );

  // Clear location state so refresh doesn't re-show notification
  if (locationState?.quizResult) {
    window.history.replaceState({}, "");
  }

  if (isLoading) {
    return <SpinnerComponent />;
  }

  if (error || !article) {
    return (
      <Center
        style={{ height: "calc(100vh - 100px)", flexDirection: "column" }}
      >
        <Title order={2}>Članak nije pronađen</Title>
        <Button mt="md" onClick={() => navigate("/edukacija")}>
          Povratak na bazu znanja
        </Button>
      </Center>
    );
  }

  const breadcrumbs = [
    <Anchor key="1" onClick={() => navigate("/edukacija")} c="dimmed">
      Baza Znanja
    </Anchor>,
    <Text key="2" truncate w={200}>
      {article.title}
    </Text>,
  ];

  const isHtml = /<[a-z][\s\S]*>/i.test(article.content);
  const renderedContent = isHtml
    ? article.content
    : article.content
        .split("\n\n")
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
        .join("");

  return (
    <Container size="md" py="xl">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate("/edukacija")}
        mb="md"
      >
        Nazad na Bazu Znanja
      </Button>

      <Breadcrumbs mb="xl">{breadcrumbs}</Breadcrumbs>

      <Badge size="lg" mb="sm" variant="light" color="blue">
        {article.tag}
      </Badge>

      <Title order={1} mb="xs" style={{ lineHeight: 1.3 }}>
        {article.title}
      </Title>

      <Group mb="xl" c="dimmed">
        <Text size="sm">Autor: {article.author}</Text>
        <Text size="sm">•</Text>
        <Text size="sm">
          {new Date(article.createdAt).toLocaleDateString("hr-HR")}
        </Text>
      </Group>

      {article.coverImage && (
        <Image
          src={article.coverImage}
          height={400}
          radius="md"
          mb="xl"
          alt={article.title}
        />
      )}

      <Text
        size="xl"
        fw={500}
        mb="xl"
        style={{
          fontStyle: "italic",
          borderLeft: "4px solid var(--mantine-color-blue-6)",
          paddingLeft: "1rem",
        }}
      >
        {article.summary}
      </Text>

      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
      </TypographyStylesProvider>

      {article.sourceUrl && (
        <Paper my="xl" p="md" withBorder radius="md" bg="dark.7">
          <Text fw={600} mb="xs">
            Izvori i znanstvena istraživanja:
          </Text>
          <Button
            component="a"
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="default"
            rightSection={<IconExternalLink size={16} />}
          >
            {article.sourceTitle || "Pročitaj izvorno istraživanje"}
          </Button>
        </Paper>
      )}

      {article.quiz && article.quiz.length > 0 && (
        <>
          <Divider my="xl" label="Provjera znanja" labelPosition="center" />
          <Paper p="xl" withBorder radius="md" ta="center">
            <IconBrain size={48} color="var(--mantine-color-blue-5)" />
            <Title order={3} mt="sm">
              Testiraj svoje znanje
            </Title>
            <Text c="dimmed" mt="xs" mb="lg">
              Riješite kviz i zaradite XP bodove!
            </Text>
            <Button
              size="lg"
              onClick={() => navigate(`/edukacija/${article._id}/kviz`)}
            >
              Započni Kviz
            </Button>
          </Paper>
        </>
      )}

      {quizResult && (
        <XpNotification
          xpGained={quizResult.xpGained}
          score={quizResult.score}
          totalQuestions={quizResult.totalQuestions}
          level={quizResult.level}
          totalXp={quizResult.totalXp}
          onClose={() => setQuizResult(null)}
        />
      )}
    </Container>
  );
};

export default ArticleDetail;
