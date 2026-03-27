import {
  Card,
  Text,
  Group,
  Progress,
  Stack,
  Badge,
  SimpleGrid,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconCircle,
  IconCircleDot,
} from "@tabler/icons-react";
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

            let icon = <IconCircle size={14} />;
            let iconVariant: "filled" | "outline" | "subtle" = "subtle";
            let iconColor = "gray";

            if (isCompleted) {
              icon = <IconCheck size={14} />;
              iconVariant = "filled";
              iconColor = "violet";
            } else if (isToday) {
              icon = <IconCircleDot size={14} />;
              iconVariant = "outline";
              iconColor = "violet";
            }

            return (
              <Tooltip key={dayNum} label={label} withArrow position="top">
                <div
                  className={`${classes.dayCell} ${isCompleted ? classes.completed : ""} ${isToday ? classes.today : ""}`}
                >
                  <Text size="xs" ta="center" c={isCompleted || isToday ? "violet" : "dimmed"} fw={isToday ? 600 : 400}>
                    {label}
                  </Text>
                  <ThemeIcon
                    variant={iconVariant}
                    color={iconColor}
                    size="sm"
                    radius="xl"
                  >
                    {icon}
                  </ThemeIcon>
                </div>
              </Tooltip>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  );
};
