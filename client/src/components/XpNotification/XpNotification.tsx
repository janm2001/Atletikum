import { useEffect, useState } from "react";
import {
  Affix,
  Badge,
  Group,
  Paper,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import { IconFlame, IconTrophy } from "@tabler/icons-react";

interface XpNotificationProps {
  xpGained: number;
  score?: number;
  totalQuestions?: number;
  level?: number;
  totalXp?: number;
  onClose?: () => void;
}

export const XpNotification = ({
  xpGained,
  score,
  totalQuestions,
  level,
  totalXp,
  onClose,
}: XpNotificationProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setMounted(true), 100);
    const hideTimer = setTimeout(() => {
      setMounted(false);
      if (onClose) setTimeout(onClose, 400);
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  return (
    <Affix position={{ bottom: 30, right: 30 }} zIndex={1000}>
      <Transition
        mounted={mounted}
        transition="slide-up"
        duration={500}
        timingFunction="ease"
      >
        {(styles) => (
          <Paper
            style={{ ...styles, cursor: "pointer" }}
            p="lg"
            withBorder
            radius="md"
            shadow="xl"
            bg="dark.6"
            w={300}
            onClick={() => {
              setMounted(false);
              if (onClose) setTimeout(onClose, 400);
            }}
          >
            <Stack align="center" gap="sm">
              <Group gap="xs">
                <IconFlame size={24} color="var(--mantine-color-orange-5)" />
                <Text size="xl" fw={700} c="teal">
                  +{xpGained} XP
                </Text>
                <IconFlame size={24} color="var(--mantine-color-orange-5)" />
              </Group>

              {score !== undefined && totalQuestions !== undefined && (
                <Group gap="xs">
                  <IconTrophy size={18} color="var(--mantine-color-yellow-5)" />
                  <Text size="sm" c="dimmed">
                    {score}/{totalQuestions} točnih odgovora
                  </Text>
                </Group>
              )}

              {level !== undefined && totalXp !== undefined && (
                <Badge size="lg" variant="light" color="blue">
                  Razina {level} • Ukupno {totalXp} XP
                </Badge>
              )}

              <Text size="xs" c="dimmed">
                Klikni za zatvaranje
              </Text>
            </Stack>
          </Paper>
        )}
      </Transition>
    </Affix>
  );
};
