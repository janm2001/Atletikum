import { Container } from "@mantine/core";
import type { QuizQuestion } from "@/types/Article/article";
import { useQuizFlow } from "@/hooks/useQuizFlow";
import QuizQuestionCard from "./QuizQuestionCard";

interface QuizPageContentProps {
  articleId: string;
  articleTitle: string;
  questions: QuizQuestion[];
  onBack: () => void;
}

const QuizPageContent = ({
  articleId,
  articleTitle,
  questions,
  onBack,
}: QuizPageContentProps) => {
  const {
    currentQuestion,
    currentQuestionIdx,
    correctOption,
    isAnswered,
    isSubmitting,
    selectedOption,
    wasCorrect,
    handleAnswerSubmit,
    handleNextQuestion,
    setSelectedOption,
  } = useQuizFlow({
    articleId,
    articleTitle,
    questions,
  });

  return (
    <Container size="sm" py="xl">
      <QuizQuestionCard
        articleTitle={articleTitle}
        question={currentQuestion}
        questionIndex={currentQuestionIdx}
        totalQuestions={questions.length}
        selectedOption={selectedOption}
        isAnswered={isAnswered}
        isSubmitting={isSubmitting}
        correctOption={correctOption}
        wasCorrect={wasCorrect}
        onBack={onBack}
        onSelectOption={setSelectedOption}
        onSubmitAnswer={handleAnswerSubmit}
        onNextQuestion={handleNextQuestion}
      />
    </Container>
  );
};

export default QuizPageContent;
