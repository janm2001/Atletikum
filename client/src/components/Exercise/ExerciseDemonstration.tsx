import { useRef, useState } from "react";
import { Alert, Anchor, AspectRatio, Button, Group, Select, Stack, Text } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { getExerciseVideo } from "@/utils/exerciseVideo";

export default function ExerciseDemonstration({ title, videoLink }: { title: string; videoLink?: string }) {
  const source = getExerciseVideo(videoLink);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  if (!source) return <Text size="sm" c="dimmed">Video za ovu vježbu još nije dodan. Zamoli trenera da ti pokaže pokret.</Text>;
  return <Stack gap="sm">
    <Text fw={600}>Pogledaj kako se izvodi</Text>
    {source.kind === "link" ? <Button component="a" href={source.url} target="_blank" rel="noopener noreferrer" variant="light">Otvori demonstraciju u novoj kartici</Button> : !loaded ? <Button type="button" variant="light" color="violet" size="md" leftSection={<IconPlayerPlay size={18} />} onClick={() => setLoaded(true)}>Učitaj video demonstraciju</Button> : source.kind === "embed" ? <AspectRatio ratio={16 / 9}><iframe src={source.url} title={`Demonstracija: ${title}`} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" style={{ border: 0, borderRadius: 12 }} /></AspectRatio> : <>
      <video ref={video} src={source.url} controls playsInline preload="metadata" aria-label={`Demonstracija: ${title}`} style={{ width: "100%", borderRadius: 12 }} onError={() => setFailed(true)} />
      <Select label="Brzina videa" defaultValue="1" allowDeselect={false} data={[{ value: "0.5", label: "Sporije (0,5×)" }, { value: "1", label: "Normalno" }]} onChange={(value) => { if (video.current) video.current.playbackRate = Number(value ?? 1); }} />
    </>}
    {failed && <Alert color="orange">Video se nije učitao. Pokušaj otvoriti izvor.</Alert>}
    <Group justify="space-between"><Text size="xs" c="dimmed">Vježbaj uz trenera. Stani ako pokret boli.</Text><Anchor size="xs" href={source.originalUrl} target="_blank" rel="noopener noreferrer">Izvor videa</Anchor></Group>
  </Stack>;
}
