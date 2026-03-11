import { Alert } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { XpNotification } from "@/components/XpNotification/XpNotification";
import type { ArticleQuizResult } from "@/types/Article/quiz";

interface ArticleQuizResultFeedbackProps {
  quizResult: ArticleQuizResult | null;
  onClose: () => void;
}

const ArticleQuizResultFeedback = ({
  quizResult,
  onClose,
}: ArticleQuizResultFeedbackProps) => {
  if (!quizResult) {
    return null;
  }

  if (quizResult.passed === false) {
    return (
      <Alert
        mt="xl"
        color="red"
        variant="light"
        icon={<IconX size={20} />}
        title="Kviz nije položen"
        withCloseButton
        onClose={onClose}
      >
        Rezultat: {quizResult.score}/{quizResult.totalQuestions} (
        {Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%).
        Potrebno je minimalno 50% za prolaz. Pokušajte ponovo nakon isteka
        vremena!
      </Alert>
    );
  }

  return (
    <XpNotification
      xpGained={quizResult.xpGained}
      score={quizResult.score}
      totalQuestions={quizResult.totalQuestions}
      level={quizResult.level}
      totalXp={quizResult.totalXp}
      onClose={onClose}
    />
  );
};

export default ArticleQuizResultFeedback;
