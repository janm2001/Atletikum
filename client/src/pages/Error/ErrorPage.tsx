import { Title, Text, Button, Container, Group } from "@mantine/core";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage: string;
  if (isRouteErrorResponse(error)) {
    errorMessage =
      error.statusText ||
      error.data?.message ||
      t('errors.generic.defaultMessage');
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = t('errors.generic.defaultMessage');
  }

  return (
    <Container style={{ textAlign: "center", paddingTop: "80px" }}>
      <Title order={1} c="red">
        {t('errors.generic.title')}
      </Title>
      <Text size="lg" mt="md">
        {errorMessage}
      </Text>
      <Group justify="center" mt="xl">
        <Button variant="outline" color="teal" onClick={() => navigate("/")}>
          {t('errors.generic.backHome')}
        </Button>
        <Button color="teal" onClick={() => window.location.reload()}>
          {t('errors.generic.retry')}
        </Button>
      </Group>
    </Container>
  );
}
