import { Stack, Tabs, Title } from "@mantine/core";
import ArticlesTab from "../../components/Article/ArticlesTab";
import WorkoutTab from "../../components/Workouts/WorkoutTab";
import ExerciseTab from "@/components/Exercise/ExerciseTab";
import ChallengeTemplateManager from "@/components/AdminChallenges/ChallengeTemplateManager";
import { useTranslation } from "react-i18next";

const AdminPanel = () => {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <Title order={2}>{t('admin.title')}</Title>

      <Tabs defaultValue="vjezbe">
        <Tabs.List>
          <Tabs.Tab value="vjezbe">{t('admin.tabs.exercises')}</Tabs.Tab>
          <Tabs.Tab value="edukacija">{t('admin.tabs.education')}</Tabs.Tab>
          <Tabs.Tab value="treninzi">{t('admin.tabs.workouts')}</Tabs.Tab>
          <Tabs.Tab value="izazovi">{t('admin.tabs.challenges')}</Tabs.Tab>
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

        <Tabs.Panel value="izazovi" pt="md">
          <ChallengeTemplateManager />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default AdminPanel;
