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
  return (
    <>
      <QuizBackButton onClick={onBack} />

      <Title order={2} mb="xs">
        {articleTitle}
      </Title>
      <Text c="dimmed" mb="sm">
        Provjera znanja
      </Text>

      <Alert
        icon={<IconTrophy size={18} />}
        color="grape"
        variant="light"
        mb="xl"
      >
        Ovaj kviz nosi do{" "}
        <Text span fw={700}>
          {totalQuestions * 25} XP
        </Text>{" "}
        bodova. Potrebno je minimalno{" "}
        <Text span fw={700}>
          50%
        </Text>{" "}
        točnih odgovora za prolaz.
      </Alert>

      <Card withBorder padding="xl" radius="md">
        <Group justify="space-between" mb="md">
          <Badge variant="outline">
            Pitanje {questionIndex + 1} / {totalQuestions}
          </Badge>
          <Badge color="blue">Kviz Znanja</Badge>
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
              <Text fw={500}>Točno! Odličan odgovor.</Text>
            ) : (
              <Text fw={500}>
                Netočno. Točan odgovor je:{" "}
                <Text span fw={700} c="green">
                  {correctOption}
                </Text>
              </Text>
            )}
          </Alert>
        )}

        <Group justify="flex-end" mt="xl">
          {!isAnswered ? (
            <Button onClick={onSubmitAnswer} disabled={selectedOption === null}>
              Potvrdi odgovor
            </Button>
          ) : (
            <Button onClick={onNextQuestion} loading={isSubmitting}>
              {questionIndex === totalQuestions - 1
                ? "Završi Kviz"
                : "Sljedeće pitanje"}
            </Button>
          )}
        </Group>
      </Card>
    </>
  );
};

export default QuizQuestionCard;
