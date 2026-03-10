import { Button, Group, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

interface DashboardSectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

const DashboardSectionHeader = ({
  title,
  actionLabel,
  onAction,
}: DashboardSectionHeaderProps) => {
  return (
    <Group justify="space-between" align="center" mb="sm">
      <Title order={3}>{title}</Title>
      {actionLabel && onAction ? (
        <Button
          variant="subtle"
          rightSection={<IconArrowRight size={16} />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Group>
  );
};

export default DashboardSectionHeader;
