import { Container, Title, Text, Button, SimpleGrid, Card, Stack } from "@mantine/core";
import { Link } from "react-router-dom";

const Welcome = () => (
  <Container size="md" py="xl"><Stack gap="xl">
    <div><Text c="violet" fw={700}>DOBRO DOŠAO/LA U ATLETIKUM</Text><Title order={1} mt="sm">Mali koraci. Velike vještine.</Title><Text size="lg" c="dimmed" mt="md">Upoznaj pokrete, uči svojim tempom i vježbaj uz trenera ili roditelja.</Text></div>
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
      {[
        ["Pogledaj", "Kratka lekcija pokazuje jednu ideju, korak po korak."],
        ["Razumij", "Odgovori na pitanje. Naučene lekcije ostaju spremljene."],
        ["Odmori", "Ne moraš dolaziti svaki dan. Odmor ne briše tvoj napredak."],
      ].map(([title, text]) => <Card key={title} withBorder radius="lg" p="lg"><Title order={2} size="h3">{title}</Title><Text c="dimmed" mt="sm">{text}</Text></Card>)}
    </SimpleGrid>
    <Button component={Link} to="/pregled" color="violet" size="lg">Pogledaj moj dan</Button>
  </Stack></Container>
);
export default Welcome;
