import { Button, Container, Group, Text, Title } from "@mantine/core";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

const AppErrorFallback = ({ onReset }: { onReset: () => void }) => {
  const { t } = useTranslation();

  return (
    <Container style={{ textAlign: "center", paddingTop: "80px" }}>
      <Title order={1} c="red">
        {t("errors.generic.title")}
      </Title>
      <Text size="lg" mt="md">
        {t("errors.generic.defaultMessage")}
      </Text>
      <Group justify="center" mt="xl">
        <Button variant="outline" color="teal" onClick={onReset}>
          {t("errors.generic.retry")}
        </Button>
        <Button color="teal" onClick={() => (window.location.href = "/") }>
          {t("errors.generic.backHome")}
        </Button>
      </Group>
    </Container>
  );
};

class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Unhandled UI error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return <AppErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
