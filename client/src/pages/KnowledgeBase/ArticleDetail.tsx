import { useParams } from "react-router-dom";
import { Button, Center, Container, Group, Text, Title } from "@mantine/core";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import { useArticleDetail } from "../../hooks/useArticle";
import ArticleActionSummary from "@/components/KnowledgeBase/Article/ArticleActionSummary";
import ArticleContentSection from "@/components/KnowledgeBase/Article/ArticleContentSection";
import ArticleDetailHeader from "@/components/KnowledgeBase/Article/ArticleDetailHeader";
import ArticleQuizResultFeedback from "@/components/KnowledgeBase/Article/ArticleQuizResultFeedback";
import ArticleQuizSection from "@/components/KnowledgeBase/Article/ArticleQuizSection";
import ArticleRelatedArticlesSection from "@/components/KnowledgeBase/Article/ArticleRelatedArticlesSection";
import ArticleRelatedExercisesSection from "@/components/KnowledgeBase/Article/ArticleRelatedExercisesSection";
import ArticleSourceCard from "@/components/KnowledgeBase/Article/ArticleSourceCard";
import { useArticleDetailFlow } from "@/hooks/useArticleDetailFlow";
import { useTranslation } from "react-i18next";

const ArticleDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading, error } = useArticleDetail(id!);
  const {
    quizStatus,
    quizResult,
    handleBack,
    handleCloseQuizResult,
    handleMarkAsRead,
    handleNavigateArticle,
    handleStartQuiz,
    handleToggleBookmark,
    handleToggleRelatedBookmark,
  } = useArticleDetailFlow({ article });

  if (isLoading) {
    return <SpinnerComponent />;
  }

  if (error || !article) {
    return (
      <Center
        style={{ height: "calc(100vh - 100px)", flexDirection: "column" }}
      >
        <Title order={2}>{t('articles.notFound')}</Title>
        <Button mt="md" onClick={handleBack}>
          {t('articles.backToKnowledgeBase')}
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
        onBack={handleBack}
        onToggleBookmark={handleToggleBookmark}
      />

      <ArticleContentSection
        title={article.title}
        coverImage={article.coverImage}
        summary={article.summary}
        renderedContent={renderedContent}
      />

      <ArticleActionSummary items={article.actionSummary} />

      <Group my="lg" justify="space-between" align="center">
        <Button variant="light" onClick={handleMarkAsRead}>
          {t('articles.markAsRead')}
        </Button>
        {article.bookmark?.lastViewedAt && (
          <Text size="sm" c="dimmed">
            {t('articles.lastRead')}{" "}
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
        onStartQuiz={handleStartQuiz}
      />

      <ArticleQuizResultFeedback
        quizResult={quizResult}
        onClose={handleCloseQuizResult}
      />

      <ArticleRelatedArticlesSection
        articles={article.relatedArticles}
        onNavigateArticle={handleNavigateArticle}
        onToggleBookmark={handleToggleRelatedBookmark}
      />

      <ArticleRelatedExercisesSection exercises={article.relatedExercises} />
    </Container>
  );
};

export default ArticleDetail;
