import { Title, Text, Button, Container, Group } from "@mantine/core";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage: string;
  if (isRouteErrorResponse(error)) {
    errorMessage =
      error.statusText ||
      error.data?.message ||
      "Dogodila se neočekivana greška.";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = "Dogodila se neočekivana greška.";
  }

  return (
    <Container style={{ textAlign: "center", paddingTop: "80px" }}>
      <Title order={1} c="red">
        Ups! Nešto je pošlo po zlu.
      </Title>
      <Text size="lg" mt="md">
        {errorMessage}
      </Text>
      <Group justify="center" mt="xl">
        <Button variant="outline" color="teal" onClick={() => navigate("/")}>
          Vrati se na početnu
        </Button>
        <Button color="teal" onClick={() => window.location.reload()}>
          Pokušaj ponovno
        </Button>
      </Group>
    </Container>
  );
}
