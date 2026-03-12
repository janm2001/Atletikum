import { useCallback, useEffect, useState } from "react";
import {
  Affix,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Transition,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

type ActionToastProps = {
  message?: string | null;
  onClose?: () => void;
};

const ActionToast = ({ message, onClose }: ActionToastProps) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const handleClose = useCallback(() => {
    setMounted(false);

    if (onClose) {
      setTimeout(onClose, 400);
    }
  }, [onClose]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const showTimer = setTimeout(() => setMounted(true), 100);
    const hideTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [handleClose, message]);

  if (!message) {
    return null;
  }

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
            style={{
              ...styles,
              cursor: "pointer",
              width: "min(320px, calc(100vw - 32px))",
            }}
            p="md"
            withBorder
            radius="md"
            shadow="xl"
            bg="var(--mantine-color-body)"
            onClick={handleClose}
            role="alert"
            aria-live="assertive"
          >
            <Stack gap="xs">
              <Group gap="sm" wrap="nowrap" align="flex-start">
                <ThemeIcon color="red" variant="light" radius="xl" size="lg">
                  <IconAlertCircle size={18} />
                </ThemeIcon>
                <Text size="sm" flex={1}>
                  {message}
                </Text>
              </Group>

              <Text size="xs" c="dimmed">
                {t("common.clickToClose")}
              </Text>
            </Stack>
          </Paper>
        )}
      </Transition>
    </Affix>
  );
};

export default ActionToast;
