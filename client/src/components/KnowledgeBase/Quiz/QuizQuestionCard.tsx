import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Radio,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck, IconTrophy, IconX } from "@tabler/icons-react";
import type { QuizQuestion } from "@/types/Article/article";
import { QuizOptionCard } from "./QuizOptionCard";
import QuizBackButton from "./QuizBackButton";
import { useTranslation } from "react-i18next";

interface QuizQuestionCardProps {
  articleTitle: string;
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: string | null;
  isAnswered: boolean;
  isSubmitting: boolean;
  correctOption: string;
  wasCorrect: boolean;
  onBack: () => void;
  onSelectOption: (value: string) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
}

const QuizQuestionCard = ({
  articleTitle,
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  isAnswered,
  isSubmitting,
  correctOption,
  wasCorrect,
  onBack,
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
}: QuizQuestionCardProps) => {
  const { t } = useTranslation();

  return (
    <>
      <QuizBackButton onClick={onBack} />

      <Title order={2} mb="xs">
        {articleTitle}
      </Title>
      <Text c="dimmed" mb="sm">
        {t('articles.quiz.sectionTitle')}
      </Text>

      <Alert
        icon={<IconTrophy size={18} />}
        color="grape"
        variant="light"
        mb="xl"
      >
        {t('articles.quiz.alertMessage', { xp: totalQuestions * 25 })}
      </Alert>

      <Card withBorder padding="xl" radius="md">
        <Group justify="space-between" mb="md">
          <Badge variant="outline">
            {t('articles.quiz.questionProgress', { current: questionIndex + 1, total: totalQuestions })}
          </Badge>
          <Badge color="blue">{t('articles.quiz.quizTitle')}</Badge>
        </Group>

        <Title order={4} mb="xl">
          {question.question}
        </Title>

        <Radio.Group
          value={selectedOption || ""}
          onChange={(value) => !isAnswered && onSelectOption(value)}
          name="quiz-options"
        >
          <Stack gap="sm">
            {question.options.map((option, index) => (
              <QuizOptionCard
                key={index}
                option={option}
                index={index}
                correctIndex={question.correctIndex}
                isAnswered={isAnswered}
                isSelected={option === selectedOption}
                onSelect={onSelectOption}
              />
            ))}
          </Stack>
        </Radio.Group>

        {isAnswered && (
          <Alert
            mt="md"
            variant="light"
            color={wasCorrect ? "green" : "red"}
            icon={wasCorrect ? <IconCheck size={18} /> : <IconX size={18} />}
          >
            {wasCorrect ? (
              <Text fw={500}>{t('articles.quiz.correctFeedback')}</Text>
            ) : (
              <Text fw={500}>
                {t('articles.quiz.incorrectFeedback', { answer: correctOption })}
              </Text>
            )}
          </Alert>
        )}

        <Group justify="flex-end" mt="xl">
          {!isAnswered ? (
            <Button onClick={onSubmitAnswer} disabled={selectedOption === null}>
              {t('articles.quiz.confirmAnswer')}
            </Button>
          ) : (
            <Button onClick={onNextQuestion} loading={isSubmitting}>
              {questionIndex === totalQuestions - 1
                ? t('articles.quiz.finishQuiz')
                : t('articles.quiz.nextQuestion')}
            </Button>
          )}
        </Group>
      </Card>
    </>
  );
};

export default QuizQuestionCard;
