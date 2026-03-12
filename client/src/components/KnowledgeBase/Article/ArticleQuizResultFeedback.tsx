import { Alert } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { XpNotification } from "@/components/XpNotification/XpNotification";
import type { ArticleQuizResult } from "@/types/Article/quiz";
import { useTranslation } from "react-i18next";

interface ArticleQuizResultFeedbackProps {
  quizResult: ArticleQuizResult | null;
  onClose: () => void;
}

const ArticleQuizResultFeedback = ({
  quizResult,
  onClose,
}: ArticleQuizResultFeedbackProps) => {
  const { t } = useTranslation();

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
        title={t('articles.quiz.failedTitle')}
        withCloseButton
        onClose={onClose}
      >
        {t('articles.quiz.failedMessage', { score: quizResult.score, total: quizResult.totalQuestions, percent: Math.round((quizResult.score / quizResult.totalQuestions) * 100) })}
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
