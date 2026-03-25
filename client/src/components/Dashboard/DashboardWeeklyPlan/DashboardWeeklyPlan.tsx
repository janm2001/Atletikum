import {
  Card,
  Text,
  Group,
  Progress,
  Stack,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useWeeklyPlan } from "@/hooks/useWeeklyPlan";
import classes from "./DashboardWeeklyPlan.module.css";

const DAY_LABEL_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export const DashboardWeeklyPlan = () => {
  const { t } = useTranslation();
  const { data: plan } = useWeeklyPlan();

  if (!plan) return null;

  return (
    <Card className={classes.card} padding="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>{t("weeklyPlan.title")}</Text>
          <Badge color="violet" variant="light">
            {plan.completedCount}/{plan.targetSessions}
          </Badge>
        </Group>

        <Progress
          value={plan.completionPercentage}
          color="violet"
          size="sm"
          radius="xl"
        />

        <SimpleGrid cols={7} spacing="xs">
          {DAY_LABEL_KEYS.map((key, idx) => {
            const label = t(`weeklyPlan.dayLabels.${key}`);
            const dayNum = idx + 1;
            const isCompleted = plan.completedDays.includes(dayNum);
            const isToday = dayNum === plan.todayIsoDay;

            return (
              <div
                key={dayNum}
                className={`${classes.dayCell} ${isCompleted ? classes.completed : ""} ${isToday ? classes.today : ""}`}
              >
                <Text size="xs" ta="center">
                  {label}
                </Text>
                <div className={classes.dayIndicator}>
                  {isCompleted ? "✓" : isToday ? "•" : "○"}
                </div>
              </div>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  );
};
