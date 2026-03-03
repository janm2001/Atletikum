import { useState } from "react";
import { Tabs } from "@mantine/core";
import Workouts from "@/components/Workouts/Workouts";
import WorkoutLogs from "@/components/WorkoutLogs/WorkoutLogs";

const TrainingLogs = () => {
  const [activeTab, setActiveTab] = useState<string | null>("workouts");
  return (
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
  );
};

export default TrainingLogs;
