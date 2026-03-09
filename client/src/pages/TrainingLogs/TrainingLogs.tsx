import { useState } from "react";
import { Container, Tabs } from "@mantine/core";
import { useLocation } from "react-router-dom";
import Workouts from "@/components/Workouts/Workouts";
import WorkoutLogs from "@/components/WorkoutLogs/WorkoutLogs";
import { XpProgressSection } from "@/components/XpProgress/XpProgressSection";

type TrainingLogsLocationState = {
  activeTab?: "workouts" | "workout-log";
};

const TrainingLogs = () => {
  const location = useLocation();
  const locationState = location.state as TrainingLogsLocationState | null;
  const [activeTab, setActiveTab] = useState<string | null>(
    locationState?.activeTab ?? "workouts",
  );

  return (
    <Container size="xl" py="md">
      <XpProgressSection variant="body" />

      <Tabs value={activeTab} onChange={setActiveTab} my={8}>
        <Tabs.List justify="center" grow>
          <Tabs.Tab value="workouts">Predloženi set vježbi</Tabs.Tab>
          <Tabs.Tab value="workout-log">Povijest vježbanja</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="workouts">
          <Workouts />
        </Tabs.Panel>
        <Tabs.Panel value="workout-log">
          <WorkoutLogs />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default TrainingLogs;
