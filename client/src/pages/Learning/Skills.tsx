import { Alert, Badge, Button, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight, IconCheck, IconPlant } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useLearningJourney } from "@/hooks/useLearningJourney";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import classes from "@/components/Learning/Learning.module.css";

export default function Skills() {
  const { data, isLoading, isError, refetch } = useLearningJourney();
  const journeyView = useLocation().pathname === "/moj-put";
  return <Container size="lg" py="xl"><Stack gap="xl">
    <div><Text className={classes.eyebrow}>ŠKOLA POKRETA · 8–12 GODINA</Text><Title order={1} mt="sm">{journeyView ? "Moj put, mojim tempom." : "Što ćemo danas otkriti?"}</Title><Text c="dimmed" mt="sm">{journeyView ? "Naučene lekcije ostaju tvoje. Odmor i propušteni dani ih ne brišu." : "Kratke lekcije za znatiželjne sportaše. Vježbaj uz trenera ili roditelja."}</Text></div>
    {isLoading ? <SpinnerComponent fullHeight={false} /> : isError || !data ? <Alert color="red" title="Lekcije se nisu učitale"><Button variant="light" onClick={() => void refetch()}>Pokušaj ponovno</Button></Alert> : <>
      {journeyView && <Alert icon={<IconPlant />} color="violet" title={`${data.completedLessonIds.length} od ${data.lessons.length} lekcija upoznato`}>Oznaka „Naučeno” znači da razumiješ lekciju. Trener provjerava izvedbu pokreta uživo.</Alert>}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {data.lessons.map((lesson, index) => {
          const complete = data.completedLessonIds.includes(lesson.id);
          return <article key={lesson.id} className={classes.lessonCard}>
            <Group justify="space-between"><Text className={classes.eyebrow}>OTKRIĆE {String(index + 1).padStart(2, "0")}</Text>{complete && <Badge color="teal" leftSection={<IconCheck size={12} />}>Naučeno</Badge>}</Group>
            <div><Text size="sm" c="dimmed">{lesson.category}</Text><Title order={2} size="h3" mt="xs">{lesson.title}</Title></div>
            <Text c="dimmed">{lesson.summary}</Text><Text size="sm">Oko {lesson.minutes} min učenja · bez zadanih ponavljanja</Text>
            <Button component={Link} to={`/vjestine/${lesson.id}`} variant={complete ? "light" : "filled"} color="violet" rightSection={<IconArrowRight size={16} />}>{complete ? "Prisjeti se lekcije" : "Otvori lekciju"}</Button>
          </article>;
        })}
      </SimpleGrid>
    </>}
  </Stack></Container>;
}
