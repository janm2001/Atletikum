import { Card, Group, Radio } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import classes from "./QuizOptionCard.module.css";

interface QuizOptionCardProps {
  option: string;
  index: number;
  correctIndex: number;
  isAnswered: boolean;
  isSelected: boolean;
  onSelect: (option: string) => void;
}

export const QuizOptionCard = ({
  option,
  index,
  correctIndex,
  isAnswered,
  isSelected,
  onSelect,
}: QuizOptionCardProps) => {
  const isCorrect = index === correctIndex;
  
  const cardClassName = [
    classes.optionCard,
    isAnswered && classes.optionCardDisabled,
    isAnswered && isCorrect && classes.optionCardCorrect,
    isAnswered && isSelected && !isCorrect && classes.optionCardIncorrect,
  ]
    .filter(Boolean)
    .join(" ");

  const labelClassName = [
    classes.optionLabel,
    isAnswered && isCorrect && classes.optionLabelCorrect,
    isAnswered && isSelected && !isCorrect && classes.optionLabelIncorrect,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      p="sm"
      withBorder
      className={cardClassName}
      onClick={() => !isAnswered && onSelect(option)}
    >
      <Group wrap="nowrap">
        <Radio
          value={option}
          label={option}
          disabled={isAnswered}
          classNames={{ label: labelClassName }}
        />
        {isAnswered && isCorrect && (
          <IconCheck
            color="var(--mantine-color-green-6)"
            size={20}
            className={classes.icon}
          />
        )}
        {isAnswered && isSelected && !isCorrect && (
          <IconX
            color="var(--mantine-color-red-6)"
            size={20}
            className={classes.icon}
          />
        )}
      </Group>
    </Card>
  );
};
