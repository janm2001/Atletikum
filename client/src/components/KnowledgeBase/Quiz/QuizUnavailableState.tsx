import { Button, Center, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface QuizUnavailableStateProps {
  onBack: () => void;
}

const QuizUnavailableState = ({ onBack }: QuizUnavailableStateProps) => {
  const { t } = useTranslation();
  return (
    <Center style={{ height: "calc(100vh - 100px)", flexDirection: "column" }}>
      <Title order={2}>{t('articles.quiz.unavailable')}</Title>
      <Button mt="md" onClick={onBack}>
        {t('articles.quiz.backToArticle')}
      </Button>
    </Center>
  );
};

export default QuizUnavailableState;
