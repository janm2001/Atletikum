import type { CSSProperties } from "react";
import { Badge, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface LevelBadgeProps {
  level: number;
  size?: string;
  color?: string;
  variant?: "badge" | "text";
  className?: string;
  style?: CSSProperties;
}

const LevelBadge = ({
  level,
  size = "sm",
  color = "violet",
  variant = "badge",
  className,
  style,
}: LevelBadgeProps) => {
  const { t } = useTranslation();

  if (variant === "text") {
    return (
      <Text size="xs" c="dimmed" className={className} style={style}>
        {t("common.levelBadge", { level })}
      </Text>
    );
  }

  return (
    <Badge variant="light" color={color} size={size} className={className} style={style}>
      {t("common.levelBadge", { level })}
    </Badge>
  );
};

export default LevelBadge;
