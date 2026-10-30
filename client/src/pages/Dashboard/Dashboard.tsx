import { useState } from "react";
import { Alert, Badge, Button, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight, IconCheck, IconHeartHandshake, IconPlant } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useChooseRest, useLearningJourney } from "@/hooks/useLearningJourney";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import classes from "@/components/Learning/Learning.module.css";

export default function Dashboard() {
  const { user } = useUser();
  const { data, isLoading, isError, refetch } = useLearningJourney();
  const rest = useChooseRest();
  const [feeling, setFeeling] = useState<"ready" | "tired" | "pain" | null>(null);
  const next = data?.lessons.find((lesson) => !data.completedLessonIds.includes(lesson.id));
  const done = data?.learnedToday || data?.restingToday;

  return <Container size="lg" py="xl"><Stack gap="xl">
    <Group justify="space-between"><div><Text className={classes.eyebrow}>TVOJ DAN U ATLETIKUMU</Text><Title order={1} size="h2" mt="xs">Bok, {user?.username ?? "sportašu"}!</Title></div><Badge variant="light" color="violet" size="lg">Škola pokreta · 8–12</Badge></Group>
    {isLoading ? <SpinnerComponent fullHeight={false} /> : isError || !data ? <Alert title="Ne možemo učitati tvoj napredak" color="red"><Stack><Text>Pokušaj ponovno. Ne moraš odraditi trening zbog ove poruke.</Text><Button onClick={() => void refetch()}>Pokušaj ponovno</Button></Stack></Alert> : <>
      <section className={classes.hero}>
        <Stack gap="lg">
          <Text className={classes.eyebrow}>{done ? "DANAS JE DOVOLJNO" : "MALI KORACI · VELIKE VJEŠTINE"}</Text>
          <Title order={2} className={classes.heroTitle}>{data.restingToday ? "Danas ima mjesta za odmor." : done ? "Bravo, današnja lekcija je gotova!" : next ? "Otkrij jednu novu vještinu." : "Pogledaj koliko si naučio/la."}</Title>
          <Text size="lg" className={classes.heroBody}>{done ? "Tvoj napredak je spremljen. Uživaj u ostatku dana — nema dodatnog zadatka ni niza koji moraš čuvati." : "Jedna kratka lekcija, bez žurbe. Pokrete vježbaj uz trenera ili roditelja, prema vašem dogovoru."}</Text>
          {!done && <div><Text fw={600} mb="sm">Kako se danas osjećaš?</Text><div className={classes.dayChoice} role="group" aria-label="Kako se danas osjećaš?">{([['ready', 'Dobro sam'], ['tired', 'Trebam predah'], ['pain', 'Nešto me boli']] as const).map(([value, label]) => <Button key={value} color={value === "pain" ? "orange" : "violet"} variant={feeling === value ? "filled" : "light"} aria-pressed={feeling === value} onClick={() => setFeeling(value)}>{label}</Button>)}</div></div>}
          {!done && feeling === "pain" ? <Alert color="orange" icon={<IconHeartHandshake />} title="Stani i reci odrasloj osobi.">Nemoj nastaviti pokret koji boli. Reci roditelju ili treneru što osjećaš. Zajedno odlučite treba li pomoć liječnika.</Alert> : !done && feeling === "tired" ? <Alert color="violet" icon={<IconPlant />} title="Predah je dobar izbor.">Dogovori odmor s roditeljem ili trenerom. Naučene lekcije ostaju spremljene.</Alert> : null}
          <Group>
            {done ? <Button component={Link} to="/moj-put" color="violet" variant="light" size="md" leftSection={<IconCheck size={18} />}>Pogledaj moj put</Button> : feeling === "pain" || feeling === "tired" ? <Button color="violet" size="md" loading={rest.isPending} onClick={() => rest.mutate()}>Odaberi odmor za danas</Button> : <><Button component={Link} to={next ? `/vjestine/${next.id}` : "/moj-put"} color="violet" size="lg" radius="xl" rightSection={<IconArrowRight size={18} />}>{next ? `${next.title} · ${next.minutes} min` : "Moj put"}</Button><Button variant="subtle" color="gray" loading={rest.isPending} onClick={() => rest.mutate()}>Danas odmaram</Button></>}
          </Group>
          {rest.isError && <Alert color="red" role="alert">Odabir odmora nije spremljen. Pokušaj ponovno; smiješ odmarati i bez aplikacije.</Alert>}
        </Stack>
      </section>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <article className={classes.lessonCard}><Text className={classes.eyebrow}>MOJA OTKRIĆA</Text><Title order={2} size="h3">{data.completedLessonIds.length} naučenih lekcija</Title><Text c="dimmed">Naučeno znači da razumiješ lekciju. Trener provjerava izvedbu pokreta uživo.</Text><Button component={Link} to="/vjestine" variant="light" color="violet">Istraži vještine</Button></article>
        <article className={classes.lessonCard}><Text className={classes.eyebrow}>ZA RODITELJE I TRENERE</Text><Title order={2} size="h3">Zajedno biramo dobar ritam.</Title><Text c="dimmed">Blogovi o trčanju i edukacija za odrasle. Napredne metode nisu dječji dnevni zadaci.</Text><Button component={Link} to="/edukacija?publika=coaches" variant="light" color="gray">Otvori blogove</Button></article>
      </SimpleGrid>
    </>}
    <Text ta="center" size="sm" c="dimmed">Napredak ostaje i kad ne otvoriš aplikaciju. Odmor je dio sporta.</Text>
  </Stack></Container>;
}
