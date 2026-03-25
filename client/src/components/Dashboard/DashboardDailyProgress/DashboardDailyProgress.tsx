import { Group, Text, RingProgress, ThemeIcon } from "@mantine/core";
import { IconBarbell } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useDailyProgress } from "@/hooks/useDailyProgress";
import classes from "./DashboardDailyProgress.module.css";

export const DashboardDailyProgress = () => {
  const { t } = useTranslation();
  const { data } = useDailyProgress();

  if (!data) return null;

  const percentage = (data.completed / data.limit) * 100;

  return (
    <Group gap="xs" className={classes.container}>
      <RingProgress
        size={40}
        thickness={4}
        sections={[{ value: percentage, color: "violet" }]}
        label={
          <ThemeIcon size="sm" radius="xl" variant="light" color="violet">
            <IconBarbell size={14} />
          </ThemeIcon>
        }
      />
      <Text size="sm" c="dimmed">
        {t("training.dailyProgress")}: {data.completed}/{data.limit}
      </Text>
    </Group>
  );
};
