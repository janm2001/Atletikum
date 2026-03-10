import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

interface QuizBackButtonProps {
  onClick: () => void;
  mb?: string | number;
}

const QuizBackButton = ({ onClick, mb = "md" }: QuizBackButtonProps) => {
  return (
    <Button
      variant="subtle"
      leftSection={<IconArrowLeft size={16} />}
      onClick={onClick}
      mb={mb}
    >
      Nazad na članak
    </Button>
  );
};

export default QuizBackButton;
