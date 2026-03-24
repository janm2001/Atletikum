import { useEffect } from "react";
import { Container, SegmentedControl, Stack, useMatches } from "@mantine/core";
import { useLocation, useSearchParams } from "react-router-dom";
import Workouts from "@/components/Workouts/Workouts";
import WorkoutLogs from "@/components/WorkoutLogs/WorkoutLogs";
import Exercises from "@/components/Dashboard/Exercises/Exercises";
import { XpProgressSection } from "@/components/XpProgress/XpProgressSection";
import { useTranslation } from "react-i18next";
import classes from "./TrainingLogs.module.css";

type TabValue = "set-vježbi" | "povijest-vježbanja" | "vježbe";

const VALID_TABS: TabValue[] = ["set-vježbi", "povijest-vježbanja", "vježbe"];

type TrainingLogsLocationState = {
  activeTab?: TabValue;
};

const isValidTab = (value: string | null): value is TabValue =>
  value != null && VALID_TABS.includes(value as TabValue);

const TrainingLogs = () => {
  const { t } = useTranslation();
  const tabOrientation = useMatches<"horizontal" | "vertical">({
    base: "vertical",
    sm: "horizontal",
  });
  const location = useLocation();
  const locationState = location.state as TrainingLogsLocationState | null;
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const tabFromState = locationState?.activeTab;

  const activeTab: string = isValidTab(tabFromUrl)
    ? tabFromUrl
    : isValidTab(tabFromState ?? null)
      ? tabFromState!
      : "set-vježbi";

  useEffect(() => {
    if (!isValidTab(tabFromUrl) && isValidTab(tabFromState ?? null)) {
      setSearchParams({ tab: tabFromState! }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  const tabData = [
    { label: t("training.suggestedTab"), value: "set-vježbi" },
    { label: t("training.historyTab"), value: "povijest-vježbanja" },
    { label: t("training.exercisesTab"), value: "vježbe" },
  ];

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        <XpProgressSection variant="body" />

        <SegmentedControl
          value={activeTab}
          onChange={handleTabChange}
          data={tabData}
          fullWidth
          orientation={tabOrientation}
          className={classes.tabs}
        />

        {activeTab === "set-vježbi" && <Workouts />}
        {activeTab === "povijest-vježbanja" && <WorkoutLogs />}
        {activeTab === "vježbe" && <Exercises showAll />}
      </Stack>
    </Container>
  );
};

export default TrainingLogs;
