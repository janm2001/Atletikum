import { useNavigate, useParams } from "react-router-dom";
import { Container } from "@mantine/core";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import { useArticleDetail } from "../../hooks/useArticle";
import { useQuizStatus } from "../../hooks/useQuiz";
import type { QuizQuestion } from "../../types/Article/article";
import QuizUnavailableState from "@/components/KnowledgeBase/Quiz/QuizUnavailableState";
import QuizLockedState from "@/components/KnowledgeBase/Quiz/QuizLockedState";
import QuizPageContent from "@/components/KnowledgeBase/Quiz/QuizPageContent";

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading: articleLoading } = useArticleDetail(id!);
  const { data: quizStatus, isLoading: statusLoading } = useQuizStatus(id!);

  if (articleLoading || statusLoading) {
    return <SpinnerComponent />;
  }

  if (!article || !article.quiz || article.quiz.length === 0) {
    return (
      <Container size="xl" py="md">
        <QuizUnavailableState onBack={() => navigate(`/edukacija/${id}`)} />
      </Container>
    );
  }

  const questions: QuizQuestion[] = article.quiz;

  if (quizStatus && !quizStatus.canTakeQuiz) {
    return (
      <Container size="xl" py="md">
        <QuizLockedState
          quizStatus={quizStatus}
          onBack={() => navigate(`/edukacija/${id}`)}
        />
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <QuizPageContent
        articleId={id!}
        articleTitle={article.title}
        questions={questions}
        onBack={() => navigate(`/edukacija/${id}`)}
      />
    </Container>
  );
};

export default QuizPage;
