import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Center, Container, Group, Text, Title } from "@mantine/core";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import {
  useArticleDetail,
  useToggleArticleBookmark,
  useUpdateArticleProgress,
} from "../../hooks/useArticle";
import { useQuizStatus } from "../../hooks/useQuiz";
import ArticleActionSummary from "@/components/KnowledgeBase/Article/ArticleActionSummary";
import ArticleContentSection from "@/components/KnowledgeBase/Article/ArticleContentSection";
import ArticleDetailHeader from "@/components/KnowledgeBase/Article/ArticleDetailHeader";
import ArticleQuizResultFeedback, {
  type ArticleQuizResult,
} from "@/components/KnowledgeBase/Article/ArticleQuizResultFeedback";
import ArticleQuizSection from "@/components/KnowledgeBase/Article/ArticleQuizSection";
import ArticleRelatedArticlesSection from "@/components/KnowledgeBase/Article/ArticleRelatedArticlesSection";
import ArticleSourceCard from "@/components/KnowledgeBase/Article/ArticleSourceCard";

type ArticleDetailLocationState = {
  quizResult?: ArticleQuizResult;
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

  const isHtml = /<[a-z][\s\S]*>/i.test(article.content);
  const renderedContent = isHtml
    ? article.content
    : article.content
        .split("\n\n")
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
        .join("");

  return (
    <Container size="md" py="xl">
      <ArticleDetailHeader
        title={article.title}
        tag={article.tag}
        author={article.author}
        createdAt={article.createdAt}
        progressPercent={article.bookmark?.progressPercent ?? 0}
        isBookmarked={Boolean(article.bookmark?.isBookmarked)}
        onBack={() => navigate("/edukacija")}
        onToggleBookmark={() =>
          toggleBookmarkMutation.mutate({
            articleId: article._id,
            shouldBookmark: !article.bookmark?.isBookmarked,
          })
        }
      />

      <ArticleContentSection
        title={article.title}
        coverImage={article.coverImage}
        summary={article.summary}
        renderedContent={renderedContent}
      />

      <ArticleActionSummary items={article.actionSummary} />

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

      <ArticleSourceCard
        sourceUrl={article.sourceUrl}
        sourceTitle={article.sourceTitle}
      />

      <ArticleQuizSection
        articleId={article._id}
        quizQuestionCount={article.quiz?.length ?? 0}
        quizStatus={quizStatus}
        onStartQuiz={(articleId) => navigate(`/edukacija/${articleId}/kviz`)}
      />

      <ArticleQuizResultFeedback
        quizResult={quizResult}
        onClose={() => setQuizResult(null)}
      />

      <ArticleRelatedArticlesSection
        articles={article.relatedArticles}
        onNavigateArticle={(nextId) => navigate(`/edukacija/${nextId}`)}
        onToggleBookmark={(related) =>
          toggleBookmarkMutation.mutate({
            articleId: related._id,
            shouldBookmark: !related.bookmark?.isBookmarked,
          })
        }
      />
    </Container>
  );
};

export default ArticleDetail;
