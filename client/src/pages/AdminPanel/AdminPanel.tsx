import { Stack, Tabs, Title } from "@mantine/core";
import ArticlesTab from "../../components/Article/ArticlesTab";
import WorkoutTab from "../../components/Workouts/WorkoutTab";
import ExerciseTab from "@/components/Exercise/ExerciseTab";

const AdminPanel = () => {
  return (
    <Stack gap="md">
      <Title order={2}>Upravljanje</Title>

      <Tabs defaultValue="vjezbe">
        <Tabs.List>
          <Tabs.Tab value="vjezbe">Vježbe</Tabs.Tab>
          <Tabs.Tab value="edukacija">Edukacija</Tabs.Tab>
          <Tabs.Tab value="treninzi">Treninzi</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vjezbe" pt="md">
          <ExerciseTab />
        </Tabs.Panel>

        <Tabs.Panel value="edukacija" pt="md">
          <ArticlesTab />
        </Tabs.Panel>

        <Tabs.Panel value="treninzi" pt="md">
          <WorkoutTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default AdminPanel;
