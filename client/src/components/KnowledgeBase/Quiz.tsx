import { useState } from "react";
import {
  Card,
  Text,
  Title,
  Radio,
  Button,
  Stack,
  Badge,
  Group,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { QuizQuestion } from "../../types/Article/article";

interface QuizProps {
  questions: QuizQuestion[];
}

export const Quiz = ({ questions }: QuizProps) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!questions || questions.length === 0) return null;

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;

    const currentQuestion = questions[currentQuestionIdx];
    const correctOption = currentQuestion.options[currentQuestion.correctIndex];

    if (selectedOption === correctOption) {
      setScore((prev) => prev + 1);
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card withBorder padding="xl" radius="md">
        <Stack align="center" gap="md">
          <Title order={3}>Kviz Završen!</Title>
          <Text size="xl" fw={700}>
            Tvoj rezultat: {score} / {questions.length}
          </Text>
          <Badge
            size="xl"
            color={
              percentage >= 70 ? "green" : percentage >= 40 ? "yellow" : "red"
            }
          >
            {percentage}%
          </Badge>
          <Button mt="md" onClick={handleRestart}>
            Pokušaj ponovno
          </Button>
        </Stack>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <Card withBorder padding="xl" radius="md">
      <Group justify="space-between" mb="md">
        <Badge variant="outline">
          Pitanje {currentQuestionIdx + 1} / {questions.length}
        </Badge>
        <Badge color="blue">Kviz Znanja</Badge>
      </Group>

      <Title order={4} mb="xl">
        {currentQuestion.question}
      </Title>

      <Radio.Group
        value={selectedOption || ""}
        onChange={(val) => !isAnswered && setSelectedOption(val)}
        name="quiz-options"
      >
        <Stack gap="sm">
          {currentQuestion.options.map((option, idx) => {
            let color = undefined;
            if (isAnswered) {
              if (idx === currentQuestion.correctIndex) {
                color = "green.6";
              } else if (
                option === selectedOption &&
                idx !== currentQuestion.correctIndex
              ) {
                color = "red.6";
              }
            }

            return (
              <Card
                key={idx}
                p="sm"
                withBorder
                style={{
                  cursor: isAnswered ? "default" : "pointer",
                  borderColor: color
                    ? `var(--mantine-color-${color})`
                    : undefined,
                  backgroundColor: color
                    ? `var(--mantine-color-${color.replace(".6", ".1")})`
                    : undefined,
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onClick={() => !isAnswered && setSelectedOption(option)}
              >
                <Group wrap="nowrap">
                  <Radio
                    value={option}
                    label={option}
                    disabled={isAnswered}
                    color={color ? color.split(".")[0] : undefined}
                    styles={{
                      label: {
                        color: color
                          ? `var(--mantine-color-${color})`
                          : undefined,
                        fontWeight: color ? 600 : undefined,
                      },
                    }}
                  />
                  {isAnswered && idx === currentQuestion.correctIndex && (
                    <IconCheck
                      color="var(--mantine-color-green-6)"
                      size={20}
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                  {isAnswered &&
                    option === selectedOption &&
                    idx !== currentQuestion.correctIndex && (
                      <IconX
                        color="var(--mantine-color-red-6)"
                        size={20}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                </Group>
              </Card>
            );
          })}
        </Stack>
      </Radio.Group>

      <Group justify="flex-end" mt="xl">
        {!isAnswered ? (
          <Button
            onClick={handleAnswerSubmit}
            disabled={selectedOption === null}
          >
            Potvrdi odgovor
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIdx === questions.length - 1
              ? "Završi Kviz"
              : "Sljedeće pitanje"}
          </Button>
        )}
      </Group>
    </Card>
  );
};
