import { Group, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useDailyProgress } from "@/hooks/useDailyProgress";
import classes from "./DashboardDailyProgress.module.css";

export const DashboardDailyProgress = () => {
  const { data } = useDailyProgress();
  if (!data || data.completed === 0) return null;
  return <Group gap="xs" className={classes.container}><IconCheck size={20} /><Text size="sm">Današnji trening je zabilježen. Dodatni trening nije potreban radi bodova.</Text></Group>;
};
