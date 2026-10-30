import { useState } from "react";
import { Alert, Badge, Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconHeartHandshake } from "@tabler/icons-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useChooseRest, useCompleteLesson, useLearningJourney } from "@/hooks/useLearningJourney";
import type { MovementLesson as Lesson } from "@/types/Learning/learning";
import MovementIllustration from "@/components/Learning/MovementIllustration";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import classes from "@/components/Learning/Learning.module.css";

function LessonContent({ lesson }: { lesson: Lesson }) {
  const [step, setStep] = useState(0);
  const [playbackKey, setPlaybackKey] = useState(0);
  const [mode, setMode] = useState<"learn" | "quiz" | "pain">("learn");
  const [answer, setAnswer] = useState<number | null>(null);
  const complete = useCompleteLesson();
  const rest = useChooseRest();
  const navigate = useNavigate();
  const cue = lesson.steps[step];
  return <Stack gap="lg">
    <div><Badge variant="light" color="violet">{lesson.category}</Badge><Title order={1} mt="sm">{lesson.title}</Title><Text c="dimmed" mt="sm">{lesson.introduction}</Text></div>
    {mode === "pain" ? <Alert color="orange" icon={<IconHeartHandshake />} title="Stani i reci odrasloj osobi.">
      <Stack><Text>Nemoj nastaviti pokret koji boli. Reci roditelju ili treneru što osjećaš. Zajedno odlučite treba li pomoć liječnika.</Text><Text>Ne gubiš naučene lekcije zato što si stao/la.</Text><Button loading={rest.isPending} onClick={() => rest.mutate(undefined, { onSuccess: () => navigate("/pregled") })} variant="light" color="orange">Završi za danas</Button>{rest.isError && <Text role="alert">Odabir nije spremljen. Pokušaj ponovno; možeš odmarati i bez aplikacije.</Text>}</Stack>
    </Alert> : mode === "learn" ? <>
      <div className={classes.lessonLayout}>
        {lesson.illustration === "sit-to-stand" ? <MovementIllustration key={playbackKey} step={step} onStep={setStep} /> : <div className={classes.stage}><Text className={classes.eyebrow}>PRVO UPOZNAJ IDEJU</Text><Title order={2} mt="lg">{lesson.id === "odmor" ? "Predah je dobar izbor." : "Miran pokret. Bez žurbe."}</Title><Text mt="md">{lesson.id === "odmor" ? "Za učenje ne moraš odraditi trening." : "Pročitaj korake, a zatim zamoli trenera da ti pokaže pokret."}</Text></div>}
        <Stack justify="space-between">
          <div className={classes.steps} role="group" aria-label="Koraci lekcije">{lesson.steps.map((_, index) => <Button key={index} variant={step === index ? "filled" : "light"} color="violet" aria-pressed={step === index} onClick={() => { setPlaybackKey((key) => key + 1); setStep(index); }}>Korak {index + 1}</Button>)}</div>
          <div className={classes.cue} aria-live="polite"><Text size="xs" c="dimmed">KORAK {step + 1} / {lesson.steps.length}</Text><Title order={2} size="h3" mt="sm">{cue.title}</Title><Text mt="sm">{cue.cue}</Text></div>
          <Text className={classes.note} size="sm">{cue.tip}</Text>
          <Button color="violet" size="md" onClick={() => setMode("quiz")}>Provjeri što si naučio/la</Button>
        </Stack>
      </div>
      <Text size="sm" c="dimmed">Ovo je lekcija za upoznavanje pokreta. Ilustracija ne provjerava tvoju tehniku; izvedbu i količinu vježbanja dogovori s trenerom.</Text>
    </> : <div className={classes.lessonCard}>
      <Text className={classes.eyebrow}>JEDNO BRZO PITANJE</Text><Title order={2}>{lesson.question}</Title>
      <Stack>{lesson.options.map((option, index) => <Button className={classes.answer} key={option} justify="flex-start" variant={answer === index ? "filled" : "light"} color="violet" aria-pressed={answer === index} disabled={complete.isPending || complete.data?.correct} onClick={() => { setAnswer(index); complete.reset(); }}>{option}</Button>)}</Stack>
      {complete.data && <Alert color={complete.data.correct ? "teal" : "orange"} title={complete.data.correct ? "Naučeno i spremljeno!" : "Pokušaj ponovno"} role="status">{complete.data.explanation}</Alert>}
      {complete.isError && <Alert color="red" title="Napredak nije spremljen" role="alert">Provjeri vezu i pokušaj ponovno. Tvoj odabrani odgovor ostaje ovdje.</Alert>}
      {complete.data?.correct ? <><Text>Za danas je dovoljno. Vježbaj prema dogovoru s trenerom, a naučena lekcija ostaje tvoja i kad odmaraš.</Text><Button component={Link} to="/pregled" color="teal" leftSection={<IconCheck size={18} />}>Završi lekciju</Button></> : <Button disabled={answer === null} loading={complete.isPending} color="violet" onClick={() => { if (answer !== null) complete.mutate({ lessonId: lesson.id, answer }); }}>Provjeri odgovor</Button>}
      <Button variant="subtle" color="gray" onClick={() => setMode("learn")}>Pogledaj korake ponovno</Button>
    </div>}
    {mode !== "pain" && <Group justify="space-between"><Text size="sm" c="dimmed">Učenje se računa. Dodatna ponavljanja nisu cilj.</Text><Button variant="light" color="orange" onClick={() => setMode("pain")}>Nešto me boli</Button></Group>}
  </Stack>;
}

export default function MovementLesson() {
  const { lessonId } = useParams();
  const { data, isLoading, isError, refetch } = useLearningJourney();
  const lesson = data?.lessons.find((entry) => entry.id === lessonId);
  return <Container size="md" py="xl"><Stack gap="lg"><Button component={Link} to="/vjestine" variant="subtle" w="fit-content" leftSection={<IconArrowLeft size={16} />}>Sve vještine</Button>
    {isLoading ? <SpinnerComponent fullHeight={false} /> : isError ? <Alert color="red" title="Lekcija se nije učitala"><Button onClick={() => void refetch()}>Pokušaj ponovno</Button></Alert> : lesson ? <LessonContent key={lesson.id} lesson={lesson} /> : <Alert title="Lekcija nije pronađena">Odaberi lekciju u pregledu vještina.</Alert>}
  </Stack></Container>;
}
