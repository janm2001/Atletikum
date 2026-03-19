import {
  ActionIcon,
  Badge,
  Card,
  Group,
  SegmentedControl,
  Text,
} from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRestTimer } from "@/hooks/useRestTimer";

const REST_PRESETS = [60, 90, 120, 180] as const;
const PRESET_STORAGE_KEY = "atletikum_rest_timer_preset";

const getStoredPreset = (): number => {
  try {
    const stored = localStorage.getItem(PRESET_STORAGE_KEY);
    if (stored) {
      const num = Number(stored);
      if (REST_PRESETS.includes(num as (typeof REST_PRESETS)[number]))
        return num;
    }
  } catch {
    // ignore
  }
  return 90;
};

type RestTimerProps = {
  exerciseRestSeconds?: number | null;
  visible: boolean;
  triggerCount: number;
};

const RestTimerComponent = ({
  exerciseRestSeconds,
  visible,
  triggerCount,
}: RestTimerProps) => {
  const { t } = useTranslation();
  const { remaining, isRunning, start, pause, resume, reset } = useRestTimer();
  const [preset, setPreset] = useState<number>(getStoredPreset);

  const effectiveDuration = exerciseRestSeconds ?? preset;

  // Auto-start timer when triggerCount increments (i.e., a set was just saved)
  const prevTriggerRef = useRef(triggerCount);
  useEffect(() => {
    if (triggerCount > prevTriggerRef.current) {
      start(effectiveDuration);
    }
    prevTriggerRef.current = triggerCount;
  }, [triggerCount, effectiveDuration, start]);

  const handlePresetChange = useCallback(
    (value: string) => {
      const num = Number(value);
      setPreset(num);
      try {
        localStorage.setItem(PRESET_STORAGE_KEY, String(num));
      } catch {
        // ignore
      }
      if (isRunning || remaining > 0) {
        start(num);
      }
    },
    [isRunning, remaining, start],
  );

  const handleStart = useCallback(() => {
    start(effectiveDuration);
  }, [effectiveDuration, start]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (!visible && remaining <= 0) return null;

  return (
    <Card withBorder radius="md" p="xs" shadow="sm" style={{ minWidth: 220 }}>
      <Group justify="space-between" gap="xs">
        <Group gap="xs">
          <Text fw={700} size="lg" ff="monospace">
            {remaining > 0
              ? formatTime(remaining)
              : t("training.timer.restTime")}
          </Text>
          {remaining <= 0 && (
            <Badge
              variant="light"
              style={{ cursor: "pointer" }}
              onClick={handleStart}
            >
              {formatTime(effectiveDuration)}
            </Badge>
          )}
        </Group>

        {remaining > 0 && (
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={isRunning ? pause : resume}
              aria-label={
                isRunning
                  ? t("training.timer.pause")
                  : t("training.timer.resume")
              }
            >
              {isRunning ? (
                <IconPlayerPause size={16} />
              ) : (
                <IconPlayerPlay size={16} />
              )}
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={reset}
              aria-label={t("training.timer.dismiss")}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        )}

        {!exerciseRestSeconds && remaining <= 0 && (
          <SegmentedControl
            size="xs"
            value={String(preset)}
            onChange={handlePresetChange}
            data={REST_PRESETS.map((p) => ({
              label: t(`training.timer.preset${p}`),
              value: String(p),
            }))}
          />
        )}
      </Group>
    </Card>
  );
};

export default RestTimerComponent;
