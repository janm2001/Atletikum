import { Button, Center, Title } from "@mantine/core";

interface QuizUnavailableStateProps {
  onBack: () => void;
}

const QuizUnavailableState = ({ onBack }: QuizUnavailableStateProps) => {
  return (
    <Center style={{ height: "calc(100vh - 100px)", flexDirection: "column" }}>
      <Title order={2}>Kviz nije dostupan</Title>
      <Button mt="md" onClick={onBack}>
        Povratak na članak
      </Button>
    </Center>
  );
};

export default QuizUnavailableState;
