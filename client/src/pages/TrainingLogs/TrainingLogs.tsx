import { useState } from "react";
import { Container, Tabs } from "@mantine/core";
import { useLocation } from "react-router-dom";
import Workouts from "@/components/Workouts/Workouts";
import WorkoutLogs from "@/components/WorkoutLogs/WorkoutLogs";
import Exercises from "@/components/Dashboard/Exercises/Exercises";
import { XpProgressSection } from "@/components/XpProgress/XpProgressSection";
import { useTranslation } from "react-i18next";

type TrainingLogsLocationState = {
  activeTab?: "workouts" | "workout-log" | "exercises";
};

const TrainingLogs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const locationState = location.state as TrainingLogsLocationState | null;
  const [activeTab, setActiveTab] = useState<string | null>(
    locationState?.activeTab ?? "workouts",
  );

  return (
    <Container size="xl" py="md">
      <XpProgressSection variant="body" />

      <Tabs value={activeTab} onChange={setActiveTab} my={16}>
        <Tabs.List
          justify="center"
          grow
          style={{
            position: "sticky",
            top: 60,
            zIndex: 10,
            backgroundColor: "var(--mantine-color-body)",
          }}
        >
          <Tabs.Tab value="workouts">{t("training.suggestedTab")}</Tabs.Tab>
          <Tabs.Tab value="workout-log">{t("training.historyTab")}</Tabs.Tab>
          <Tabs.Tab value="exercises">{t("training.exercisesTab")}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="workouts">
          <Workouts />
        </Tabs.Panel>
        <Tabs.Panel value="workout-log">
          <WorkoutLogs />
        </Tabs.Panel>
        <Tabs.Panel value="exercises">
          <Exercises />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default TrainingLogs;
