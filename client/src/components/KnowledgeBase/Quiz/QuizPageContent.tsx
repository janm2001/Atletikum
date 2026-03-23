import { Container } from "@mantine/core";
import ActionToast from "@/components/Common/ActionToast";
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
    actionError,
    clearActionError,
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
    <Container size="sm" py={{ base: "sm", md: "md" }}>
      <ActionToast message={actionError} onClose={clearActionError} />

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
