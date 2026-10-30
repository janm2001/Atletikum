import { Button, Card, Stack, Text, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface CelebrationWhatsNextCardProps {
  isQuiz: boolean;
  xpRemaining: number;
  nextLevel: number;
  onNavigate: (path: string) => void;
}

const CelebrationWhatsNextCard = ({ onNavigate }: CelebrationWhatsNextCardProps) => (
  <Card withBorder radius="lg" shadow="sm" p="xl" w="100%">
    <Stack align="center" gap="md">
      <IconCheck size={28} color="var(--mantine-color-teal-6)" />
      <Title order={3}>Dovršeno. Za danas je dovoljno.</Title>
      <Text size="sm" c="dimmed" ta="center">Ne trebaš dodatni trening radi bodova. Odmor je dio napretka.</Text>
      <Button color="violet" onClick={() => onNavigate("/pregled")}>Povratak na moj dan</Button>
    </Stack>
  </Card>
);
export default CelebrationWhatsNextCard;
