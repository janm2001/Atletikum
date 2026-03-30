import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import ConfettiTrigger from "@/components/Celebrations/ConfettiTrigger";

interface XpNotificationProps {
  xpGained: number;
  score?: number;
  totalQuestions?: number;
  level?: number;
  totalXp?: number;
  onClose?: () => void;
}

const useCountUp = (target: number, duration = 800) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
};

export const XpNotification = ({
  xpGained,
  score,
  totalQuestions,
  level,
  totalXp,
  onClose,
}: XpNotificationProps) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [pulse, setPulse] = useState(false);
  const displayXp = useCountUp(xpGained, 700);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setMounted(true);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 100);
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
    <>
      <ConfettiTrigger trigger={mounted} variant="default" />
      <Affix position={{ bottom: 30, right: 30 }} zIndex={1000}>
        <Transition
          mounted={mounted}
          transition="slide-up"
          duration={500}
          timingFunction="ease"
        >
          {(styles) => (
            <Paper
              style={{
                ...styles,
                cursor: "pointer",
                transform: `${styles.transform ?? ""} scale(${pulse ? 1.05 : 1})`,
                transition: "transform 0.3s ease",
              }}
              p="lg"
              withBorder
              radius="md"
              shadow="xl"
              bg="dark.6"
              w={300}
              role="status"
              aria-live="polite"
              onClick={() => {
                setMounted(false);
                if (onClose) setTimeout(onClose, 400);
              }}
            >
              <Stack align="center" gap="sm">
                <Group gap="xs">
                  <IconFlame size={24} color="var(--mantine-color-orange-5)" />
                  <Text size="xl" fw={700} c="teal">
                    +{displayXp} XP
                  </Text>
                  <IconFlame size={24} color="var(--mantine-color-orange-5)" />
                </Group>

                {score !== undefined && totalQuestions !== undefined && (
                  <Group gap="xs">
                    <IconTrophy size={18} color="var(--mantine-color-yellow-5)" />
                    <Text size="sm" c="dimmed">
                      {score}/{totalQuestions} {t('xpNotification.correctAnswers')}
                    </Text>
                  </Group>
                )}

                {level !== undefined && totalXp !== undefined && (
                  <Badge size="lg" variant="light" color="blue">
                    {t('xpNotification.levelInfo', { level, xp: totalXp })}
                  </Badge>
                )}

                <Text size="xs" c="dimmed">
                  {t('common.clickToClose')}
                </Text>
              </Stack>
            </Paper>
          )}
        </Transition>
      </Affix>
    </>
  );
};
