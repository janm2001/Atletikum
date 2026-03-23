import {
  Group,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconFlame,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const getTimeRemaining = (expiresAt: string | null) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
};

interface NavbarStreakDropdownProps {
  streakAtRisk: boolean;
  hasActivityToday: boolean;
  streakExpiresAt: string | null;
  dailyStreak: number;
}

const NavbarStreakDropdown = ({
  streakAtRisk,
  hasActivityToday,
  streakExpiresAt,
  dailyStreak,
}: NavbarStreakDropdownProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const mode = computedColorScheme === "dark" ? "dark" : "light";
  const muted = theme.other.stitch[mode].textMuted;
  const remaining = getTimeRemaining(streakExpiresAt);

  return (
    <Stack gap={6}>
      <Group gap={6}>
        <IconFlame size={16} color="var(--mantine-color-orange-5)" />
        <Text size="sm" fw={600}>
          {dailyStreak} {t("dashboard.stats.dailyStreak")}
        </Text>
      </Group>
      {streakAtRisk && remaining && (
        <>
          <Group gap={4}>
            <IconAlertTriangle
              size={14}
              color="var(--mantine-color-red-5)"
            />
            <Text size="xs" c="red" fw={600}>
              {t("nav.streakAtRisk")}
            </Text>
          </Group>
          <Text size="xs" c={muted}>
            {t("nav.streakExpires", {
              hours: remaining.hours,
              minutes: remaining.minutes,
            })}
          </Text>
          <Text size="xs" c="orange" fw={500}>
            {t("nav.keepStreak")}
          </Text>
        </>
      )}
      {hasActivityToday && (
        <Group gap={4}>
          <IconCheck size={14} color="var(--mantine-color-green-5)" />
          <Text size="xs" c="green">
            {t("nav.streakSafe")}
          </Text>
        </Group>
      )}
    </Stack>
  );
};

export default NavbarStreakDropdown;
