import { useState } from "react";
import { Tabs } from "@mantine/core";
import { useLocation } from "react-router-dom";
import Workouts from "@/components/Workouts/Workouts";
import WorkoutLogs from "@/components/WorkoutLogs/WorkoutLogs";
import { XpNotification } from "@/components/XpNotification/XpNotification";

type TrainingLogsLocationState = {
  activeTab?: "workouts" | "workout-log";
  xpResult?: {
    xpGained: number;
    workoutTitle: string;
  };
};

const TrainingLogs = () => {
  const location = useLocation();
  const locationState = location.state as TrainingLogsLocationState | null;
  const [activeTab, setActiveTab] = useState<string | null>(
    locationState?.activeTab ?? "workouts",
  );
  const [xpResult, setXpResult] = useState(locationState?.xpResult ?? null);

  // Clear location state so refresh doesn't re-show notification
  if (locationState?.xpResult) {
    window.history.replaceState({}, "");
  }

  return (
    <>
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

      {xpResult && (
        <XpNotification
          xpGained={xpResult.xpGained}
          onClose={() => setXpResult(null)}
        />
      )}
    </>
  );
};

export default TrainingLogs;
