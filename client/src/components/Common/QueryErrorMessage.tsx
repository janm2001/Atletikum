import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

interface QueryErrorMessageProps {
  message: string;
}

const QueryErrorMessage = ({ message }: QueryErrorMessageProps) => (
  <Group gap="xs" role="alert">
    <ThemeIcon color="red" variant="light" size="sm">
      <IconAlertCircle size={14} />
    </ThemeIcon>
    <Text c="red" size="sm">{message}</Text>
  </Group>
);

export default QueryErrorMessage;
