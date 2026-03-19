import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

type DraftPromptProps = {
  isSubmitting: boolean;
  hasRepeatOption: boolean;
  onResume: () => void;
  onStartFresh: () => void;
  onRepeatLast: () => void;
  onRetry: () => void;
};

const DraftPrompt = ({
  isSubmitting,
  hasRepeatOption,
  onResume,
  onStartFresh,
  onRepeatLast,
  onRetry,
}: DraftPromptProps) => {
  const { t } = useTranslation();

  if (isSubmitting) {
    return (
      <Card withBorder radius="md" p="xl" shadow="sm">
        <Stack align="center" gap="md">
          <Title order={3}>{t("training.draft.submittingTitle")}</Title>
          <Text c="dimmed" ta="center">
            {t("training.draft.submittingDescription")}
          </Text>
          <Button onClick={onRetry}>{t("training.draft.retry")}</Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="xl" shadow="sm">
      <Stack align="center" gap="md">
        <Title order={3}>{t("training.draft.resumeTitle")}</Title>
        <Text c="dimmed" ta="center">
          {t("training.draft.resumeDescription")}
        </Text>
        <Group>
          <Button onClick={onResume}>{t("training.draft.resume")}</Button>
          <Button variant="light" onClick={onStartFresh}>
            {t("training.draft.startFresh")}
          </Button>
          {hasRepeatOption && (
            <Button variant="subtle" onClick={onRepeatLast}>
              {t("training.draft.repeatLast")}
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default DraftPrompt;
