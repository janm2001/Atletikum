import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface QuizBackButtonProps {
  onClick: () => void;
  mb?: string | number;
}

const QuizBackButton = ({ onClick, mb = "md" }: QuizBackButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="subtle"
      color="violet"
      leftSection={<IconArrowLeft size={16} />}
      onClick={onClick}
      mb={mb}
    >
      {t('articles.quiz.backToArticle')}
    </Button>
  );
};

export default QuizBackButton;
