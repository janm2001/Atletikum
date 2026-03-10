import { useMemo } from "react";
import {
  Card,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  ThemeIcon,
  Button,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  IconFlame,
  IconStars,
  IconTrophy,
  IconArrowRight,
} from "@tabler/icons-react";
import Exercises from "../../components/Dashboard/Exercises/Exercises";
import WorkoutCard from "../../components/Workouts/WorkoutCard";
import { ArticleCard } from "../../components/KnowledgeBase/ArticleCard";
import { XpProgressSection } from "../../components/XpProgress/XpProgressSection";
import { useUser } from "../../hooks/useUser";
import { useArticles } from "../../hooks/useArticle";
import { useWorkouts } from "../../hooks/useWorkout";
import { useMyQuizCompletions } from "../../hooks/useQuiz";
import { getLevelFromTotalXp } from "../../utils/leveling";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useWeeklyRecommendations } from "@/hooks/useRecommendations";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: workouts } = useWorkouts();
  const { data: completedArticleIds } = useMyQuizCompletions();
  const { data: recommendations, isLoading: recommendationsLoading } =
    useWeeklyRecommendations();

  const completedSet = useMemo(
    () => new Set(completedArticleIds ?? []),
    [completedArticleIds],
  );

  const level = user ? getLevelFromTotalXp(user.totalXp) : 1;

  const suggestedWorkout = useMemo(() => {
    if (recommendations?.workouts?.[0]) {
      return recommendations.workouts[0];
    }

    if (!workouts || !user) return null;
    const available = workouts
      .filter((w) => w.requiredLevel <= level)
      .sort((a, b) => b.requiredLevel - a.requiredLevel);
    return available[0] ?? workouts[0] ?? null;
  }, [recommendations?.workouts, workouts, user, level]);

  const topArticles = useMemo(() => {
    if (recommendations?.articles?.length) {
      return recommendations.articles;
    }

    return (articles ?? []).slice(0, 3);
  }, [articles, recommendations]);

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        <div>
          <Text c="dimmed" mt={4}>
            Pratite svoj napredak, učite i trenirajte — sve na jednom mjestu.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
          <Card withBorder radius="md" shadow="sm" p="md">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color="violet" variant="light">
                <IconTrophy size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Razina
                </Text>
                <Text size="xl" fw={700}>
                  {level}
                </Text>
              </div>
            </Group>
          </Card>
          <Card withBorder radius="md" shadow="sm" p="md">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                <IconStars size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Ukupni XP
                </Text>
                <Text size="xl" fw={700}>
                  {user?.totalXp ?? 0}
                </Text>
              </div>
            </Group>
          </Card>
          <Card withBorder radius="md" shadow="sm" p="md">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color="orange" variant="light">
                <IconFlame size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Dnevni niz
                </Text>
                <Text size="xl" fw={700}>
                  {user?.dailyStreak ?? 0}
                </Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        <XpProgressSection variant="full" />

        {recommendations?.revision && (
          <Card withBorder radius="md" shadow="sm" p="md">
            <Group justify="space-between" align="center" wrap="wrap">
              <div>
                <Title order={4}>Vrijeme za ponavljanje</Title>
                <Text c="dimmed" size="sm" mt={4}>
                  Zadnji rezultat: {recommendations.revision.lastScore}/
                  {recommendations.revision.totalQuestions}. Ponovi gradivo i
                  osvoji novi XP.
                </Text>
              </div>
              <Button
                onClick={() =>
                  navigate(
                    `/edukacija/${recommendations.revision?.articleId}/kviz`,
                  )
                }
              >
                Pokreni revision kviz
              </Button>
            </Group>
          </Card>
        )}

        {recommendations?.insight && (
          <Card withBorder radius="md" shadow="sm" p="md">
            <Stack gap={4}>
              <Title order={4}>Tjedni fokus</Title>
              <Text size="sm" c="dimmed">
                {recommendations.insight.focusReason}
              </Text>
              <Text size="sm">
                Ovaj tjedan: {recommendations.insight.completedThisWeek}/
                {recommendations.insight.weeklyTarget} treninga · spremnost{" "}
                {recommendations.insight.readinessScore}/5
              </Text>
            </Stack>
          </Card>
        )}

        <div>
          <Group justify="space-between" align="center" mb="sm">
            <Title order={3}>Preporučeni članci</Title>
            <Button
              variant="subtle"
              rightSection={<IconArrowRight size={16} />}
              onClick={() => navigate("/edukacija")}
            >
              Svi članci
            </Button>
          </Group>
          {articlesLoading || recommendationsLoading ? (
            <SpinnerComponent size="md" fullHeight={false} />
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {topArticles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  isQuizCompleted={completedSet.has(article._id)}
                  onNavigate={(id) => navigate(`/edukacija/${id}`)}
                />
              ))}
            </SimpleGrid>
          )}
        </div>

        {suggestedWorkout && (
          <div>
            <Group justify="space-between" align="center" mb="sm">
              <Title order={3}>Predloženi trening</Title>
              <Button
                variant="subtle"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate("/zapis-treninga")}
              >
                Svi treninzi
              </Button>
            </Group>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
                <WorkoutCard workout={suggestedWorkout} />
              </Grid.Col>
            </Grid>
          </div>
        )}

        <Exercises />
      </Stack>
    </Container>
  );
};

export default Dashboard;
