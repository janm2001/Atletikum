import type { ReactNode } from "react";
import { Card, Group } from "@mantine/core";

interface CelebrationItemCardProps {
  accentColor: string;
  align?: "flex-start" | "center";
  children: ReactNode;
}

const CelebrationItemCard = ({
  accentColor,
  align = "flex-start",
  children,
}: CelebrationItemCardProps) => (
  <Card
    withBorder
    radius="md"
    p="md"
    w="100%"
    style={{
      borderColor: `var(--mantine-color-${accentColor}-5)`,
      backgroundColor: `var(--mantine-color-${accentColor}-light)`,
    }}
  >
    <Group justify="space-between" align={align}>
      {children}
    </Group>
  </Card>
);

export default CelebrationItemCard;
