import { Button, Center, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import classes from "./QuizUnavailableState.module.css";

interface QuizUnavailableStateProps {
  onBack: () => void;
}

const QuizUnavailableState = ({ onBack }: QuizUnavailableStateProps) => {
  const { t } = useTranslation();
  return (
    <Center className={classes.centerContainer}>
      <Title order={2}>{t('articles.quiz.unavailable')}</Title>
      <Button mt="md" color="violet" onClick={onBack}>
        {t('articles.quiz.backToArticle')}
      </Button>
    </Center>
  );
};

export default QuizUnavailableState;
