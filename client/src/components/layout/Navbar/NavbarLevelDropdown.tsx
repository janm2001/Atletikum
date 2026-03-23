import {
  Progress,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { getXpProgress } from "../../../utils/leveling";

interface NavbarLevelDropdownProps {
  level: number;
  totalXp: number;
}

const NavbarLevelDropdown = ({ level, totalXp }: NavbarLevelDropdownProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const mode = computedColorScheme === "dark" ? "dark" : "light";
  const muted = theme.other.stitch[mode].textMuted;
  const { xpInLevel, xpForNext, remaining, percent } = getXpProgress(
    level,
    totalXp,
  );

  return (
    <Stack gap={6}>
      <Text size="sm" fw={600}>
        {t("nav.levelProgress", { current: level, next: level + 1 })}
      </Text>
      <Progress value={percent} color="stitch" radius="xl" size="md" />
      <Text size="xs" c={muted}>
        {t("nav.xpProgress", { current: xpInLevel, total: xpForNext, percent })}
      </Text>
      <Text size="xs" c={muted}>
        {t("nav.xpRemaining", { remaining })}
      </Text>
    </Stack>
  );
};

export default NavbarLevelDropdown;
