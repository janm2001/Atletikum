import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ActionIcon,
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
  Stack,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import {
  IconArrowLeft,
  IconExternalLink,
  IconBrain,
  IconLock,
  IconCheck,
  IconX,
  IconClock,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react";
import {
  useArticleDetail,
  useToggleArticleBookmark,
  useUpdateArticleProgress,
} from "../../hooks/useArticle";
import { useQuizStatus } from "../../hooks/useQuiz";
import { XpNotification } from "../../components/XpNotification/XpNotification";
import { ArticleCard } from "../../components/KnowledgeBase/ArticleCard";

type ArticleDetailLocationState = {
  quizResult?: {
    xpGained: number;
    score: number;
    totalQuestions: number;
    level?: number;
    totalXp?: number;
    passed?: boolean;
  };
} | null;

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: article, isLoading, error } = useArticleDetail(id!);
  const toggleBookmarkMutation = useToggleArticleBookmark();
  const updateProgressMutation = useUpdateArticleProgress();
  const hasTrackedOpenRef = useRef(false);

  const hasQuiz = !!(article?.quiz && article.quiz.length > 0);
  const { data: quizStatus } = useQuizStatus(hasQuiz ? id! : "");

  const locationState = location.state as ArticleDetailLocationState;
  const [quizResult, setQuizResult] = useState(
    locationState?.quizResult ?? null,
  );

  // Clear location state so refresh doesn't re-show notification
  if (locationState?.quizResult) {
    window.history.replaceState({}, "");
  }

  useEffect(() => {
    if (!article || hasTrackedOpenRef.current) {
      return;
    }

    hasTrackedOpenRef.current = true;
    const currentProgress = article.bookmark?.progressPercent ?? 0;

    if (currentProgress < 25) {
      updateProgressMutation.mutate({
        articleId: article._id,
        progressPercent: 25,
      });
    }
  }, [article, updateProgressMutation]);

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

      <Group justify="space-between" align="flex-start" gap="sm">
        <Title order={1} mb="xs" style={{ lineHeight: 1.3 }}>
          {article.title}
        </Title>
        <ActionIcon
          variant="light"
          color={article.bookmark?.isBookmarked ? "grape" : "gray"}
          size="lg"
          onClick={() =>
            toggleBookmarkMutation.mutate({
              articleId: article._id,
              shouldBookmark: !article.bookmark?.isBookmarked,
            })
          }
        >
          {article.bookmark?.isBookmarked ? (
            <IconBookmarkFilled size={18} />
          ) : (
            <IconBookmark size={18} />
          )}
        </ActionIcon>
      </Group>

      <Group mb="xl" c="dimmed">
        <Text size="sm">Autor: {article.author}</Text>
        <Text size="sm">•</Text>
        <Text size="sm">
          {new Date(article.createdAt).toLocaleDateString("hr-HR")}
        </Text>
        <Text size="sm">•</Text>
        <Text size="sm">
          Napredak: {article.bookmark?.progressPercent ?? 0}%
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

      {article.actionSummary && article.actionSummary.length > 0 && (
        <Paper my="xl" p="md" withBorder radius="md">
          <Title order={4} mb="sm">
            Primijeni odmah
          </Title>
          <Stack gap="xs">
            {article.actionSummary.map((item, index) => (
              <Text key={`${item}-${index}`} size="sm">
                {index + 1}. {item}
              </Text>
            ))}
          </Stack>
        </Paper>
      )}

      <Group my="lg" justify="space-between" align="center">
        <Button
          variant="light"
          onClick={() =>
            updateProgressMutation.mutate({
              articleId: article._id,
              progressPercent: 100,
              isCompleted: true,
            })
          }
        >
          Označi kao pročitano
        </Button>
        {article.bookmark?.lastViewedAt && (
          <Text size="sm" c="dimmed">
            Zadnje čitanje:{" "}
            {new Date(article.bookmark.lastViewedAt).toLocaleDateString(
              "hr-HR",
            )}
          </Text>
        )}
      </Group>

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

      {hasQuiz && (
        <>
          <Divider my="xl" label="Provjera znanja" labelPosition="center" />
          <Paper p="xl" withBorder radius="md" ta="center">
            {/* Quiz locked - on cooldown */}
            {quizStatus &&
            !quizStatus.canTakeQuiz &&
            quizStatus.lastCompletion ? (
              <Stack align="center" gap="md">
                <IconLock size={48} color="var(--mantine-color-gray-5)" />
                <Title order={3}>Kviz je zaključan</Title>
                <Text c="dimmed">
                  Već ste riješili ovaj kviz. Pokušajte ponovo nakon isteka
                  vremena.
                </Text>

                <Group justify="center" gap="lg" mt="xs">
                  <Stack gap={2} align="center">
                    <Text size="xl" fw={700}>
                      {quizStatus.lastCompletion.score}/
                      {quizStatus.lastCompletion.totalQuestions}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Točnih
                    </Text>
                  </Stack>
                  <Stack gap={2} align="center">
                    <Text size="xl" fw={700} c="teal">
                      +{quizStatus.lastCompletion.xpGained}
                    </Text>
                    <Text size="xs" c="dimmed">
                      XP zarađeno
                    </Text>
                  </Stack>
                  <Stack gap={2} align="center">
                    <Badge
                      size="lg"
                      color={quizStatus.lastCompletion.passed ? "green" : "red"}
                      variant="light"
                      leftSection={
                        quizStatus.lastCompletion.passed ? (
                          <IconCheck size={14} />
                        ) : (
                          <IconX size={14} />
                        )
                      }
                    >
                      {quizStatus.lastCompletion.passed
                        ? "Položen"
                        : "Nije položen"}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Status
                    </Text>
                  </Stack>
                </Group>

                {quizStatus.nextAvailableAt && (
                  <Alert
                    icon={<IconClock size={18} />}
                    color="blue"
                    variant="light"
                    w="100%"
                    maw={400}
                    mx="auto"
                  >
                    Kviz će biti dostupan{" "}
                    <Text span fw={600}>
                      {new Date(quizStatus.nextAvailableAt).toLocaleDateString(
                        "hr-HR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </Text>
                  </Alert>
                )}
              </Stack>
            ) : quizStatus?.lastCompletion ? (
              <Stack align="center" gap="md">
                <IconBrain size={48} color="var(--mantine-color-blue-5)" />
                <Title order={3}>Testiraj svoje znanje</Title>

                <Group justify="center" gap="md">
                  <Badge
                    size="lg"
                    color={quizStatus.lastCompletion.passed ? "green" : "red"}
                    variant="light"
                    leftSection={
                      quizStatus.lastCompletion.passed ? (
                        <IconCheck size={14} />
                      ) : (
                        <IconX size={14} />
                      )
                    }
                  >
                    Prethodni rezultat: {quizStatus.lastCompletion.score}/
                    {quizStatus.lastCompletion.totalQuestions} -{" "}
                    {quizStatus.lastCompletion.passed
                      ? "Položen"
                      : "Nije položen"}
                  </Badge>
                </Group>

                <Text c="dimmed" size="sm">
                  Riješite kviz ponovo i poboljšajte rezultat!
                </Text>

                <Badge size="lg" variant="light" color="grape">
                  Do {article!.quiz!.length * 25} XP (min. 50% za prolaz)
                </Badge>

                <Button
                  size="lg"
                  onClick={() => navigate(`/edukacija/${article!._id}/kviz`)}
                >
                  Ponovi Kviz
                </Button>
              </Stack>
            ) : (
              <Stack align="center" gap="md">
                <IconBrain size={48} color="var(--mantine-color-blue-5)" />
                <Title order={3}>Testiraj svoje znanje</Title>
                <Text c="dimmed">Riješite kviz i zaradite XP bodove!</Text>
                <Badge size="lg" variant="light" color="grape">
                  Do {article!.quiz!.length * 25} XP (min. 50% za prolaz)
                </Badge>
                <Button
                  size="lg"
                  onClick={() => navigate(`/edukacija/${article!._id}/kviz`)}
                >
                  Započni Kviz
                </Button>
              </Stack>
            )}
          </Paper>
        </>
      )}

      {quizResult && quizResult.passed === false && (
        <Alert
          mt="xl"
          color="red"
          variant="light"
          icon={<IconX size={20} />}
          title="Kviz nije položen"
          withCloseButton
          onClose={() => setQuizResult(null)}
        >
          Rezultat: {quizResult.score}/{quizResult.totalQuestions} (
          {Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%).
          Potrebno je minimalno 50% za prolaz. Pokušajte ponovo nakon isteka
          vremena!
        </Alert>
      )}

      {quizResult && quizResult.passed !== false && (
        <XpNotification
          xpGained={quizResult.xpGained}
          score={quizResult.score}
          totalQuestions={quizResult.totalQuestions}
          level={quizResult.level}
          totalXp={quizResult.totalXp}
          onClose={() => setQuizResult(null)}
        />
      )}

      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <>
          <Divider my="xl" label="Povezani članci" labelPosition="center" />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {article.relatedArticles.map((relatedArticle) => (
              <ArticleCard
                key={relatedArticle._id}
                article={relatedArticle}
                onNavigate={(nextId) => navigate(`/edukacija/${nextId}`)}
                onToggleBookmark={(related) =>
                  toggleBookmarkMutation.mutate({
                    articleId: related._id,
                    shouldBookmark: !related.bookmark?.isBookmarked,
                  })
                }
              />
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
};

export default ArticleDetail;
