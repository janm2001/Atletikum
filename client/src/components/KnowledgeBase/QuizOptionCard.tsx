import { Card, Group, Radio } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

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
  let color: string | undefined;

  if (isAnswered) {
    if (isCorrect) {
      color = "green.6";
    } else if (isSelected && !isCorrect) {
      color = "red.6";
    }
  }

  return (
    <Card
      p="sm"
      withBorder
      style={{
        cursor: isAnswered ? "default" : "pointer",
        borderColor: color ? `var(--mantine-color-${color})` : undefined,
        backgroundColor: color
          ? `var(--mantine-color-${color.replace(".6", ".1")})`
          : undefined,
        transition: "border-color 0.2s, background-color 0.2s",
      }}
      onClick={() => !isAnswered && onSelect(option)}
    >
      <Group wrap="nowrap">
        <Radio
          value={option}
          label={option}
          disabled={isAnswered}
          color={color ? color.split(".")[0] : undefined}
          styles={{
            label: {
              color: color ? `var(--mantine-color-${color})` : undefined,
              fontWeight: color ? 600 : undefined,
            },
          }}
        />
        {isAnswered && isCorrect && (
          <IconCheck
            color="var(--mantine-color-green-6)"
            size={20}
            style={{ marginLeft: "auto" }}
          />
        )}
        {isAnswered && isSelected && !isCorrect && (
          <IconX
            color="var(--mantine-color-red-6)"
            size={20}
            style={{ marginLeft: "auto" }}
          />
        )}
      </Group>
    </Card>
  );
};
