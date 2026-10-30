import { useEffect, useRef, useState } from "react";
import { Button, SimpleGrid, Select, Text } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import classes from "./Learning.module.css";

const poses = [
  { hip: [184, 150], knee: [192, 215], shoulder: [186, 85], head: [190, 53], elbow: [218, 113], hand: [235, 142] },
  { hip: [144, 210], knee: [208, 216], shoulder: [172, 151], head: [188, 121], elbow: [213, 158], hand: [245, 160] },
  { hip: [184, 150], knee: [192, 215], shoulder: [186, 85], head: [190, 53], elbow: [218, 113], hand: [235, 142] },
];
type Pose = typeof poses[number];
const path = (...points: number[][]) => points.map((point, index) => `${index ? "L" : "M"}${point.join(" ")}`).join(" ");

export default function MovementIllustration({ step, onStep }: { step: number; onStep: (step: number) => void }) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("1");
  const [animatedPose, setAnimatedPose] = useState(poses[0]);
  const reducedMotion = useReducedMotion();
  const onStepRef = useRef(onStep);
  useEffect(() => { onStepRef.current = onStep; }, [onStep]);
  useEffect(() => {
    if (!playing || reducedMotion) return;
    let frame = 0;
    let start: number | null = null;
    const animate = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / (4000 / Number(speed)), 1);
      const phase = progress * 2;
      const index = Math.min(Math.floor(phase), 1);
      const amount = (1 - Math.cos(Math.PI * (phase - index))) / 2;
      const pose = Object.fromEntries(Object.keys(poses[0]).map((key) => {
        const part = key as keyof Pose;
        return [part, poses[index][part].map((value, axis) => value + (poses[index + 1][part][axis] - value) * amount)];
      })) as Pose;
      setAnimatedPose(pose);
      onStepRef.current(progress < .2 ? 0 : progress < .7 ? 1 : 2);
      if (progress < 1) frame = requestAnimationFrame(animate);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, reducedMotion]);
  const pose = playing && !reducedMotion ? animatedPose : poses[step] ?? poses[0];
  return <div className={classes.stage}>
    <Text size="xs" c="dimmed">Bočni pogled · pojednostavljena ilustracija</Text>
    <svg viewBox="0 0 340 320" className={classes.motion} role="img" aria-label={`Sjedni i ustani, korak ${step + 1}`}>
      <path d="M88 222H163M96 225V282M155 225V282" fill="none" className={classes.bench} strokeWidth="9" strokeLinecap="round" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={path(pose.hip, pose.knee, [191, 279], [218, 279])} className={classes.limb} strokeWidth="14" />
        <path d={path(pose.shoulder, pose.hip)} className={classes.body} strokeWidth="25" />
        <path d={path(pose.shoulder, pose.elbow, pose.hand)} className={classes.body} strokeWidth="11" />
        <circle cx={pose.head[0]} cy={pose.head[1]} r="16" fill="var(--mantine-color-violet-light-color)" />
      </g>
    </svg>
    <SimpleGrid cols={{ base: 1, sm: 2 }} style={{ alignItems: "end" }}>
      <Button type="button" color="violet" size="md" onClick={() => {
        if (reducedMotion) onStep((step + 1) % 3);
        else { setAnimatedPose(poses[0]); setPlaying(!playing); }
      }}>{reducedMotion ? "Sljedeći položaj" : playing ? "Zaustavi prikaz" : "Prikaži pokret"}</Button>
      {!reducedMotion && <Select label="Brzina prikaza" value={speed} onChange={(value) => { setPlaying(false); setSpeed(value ?? "1"); }} data={[{ value: "1", label: "Normalno" }, { value: "0.5", label: "Sporije" }]} allowDeselect={false} />}
    </SimpleGrid>
  </div>;
}
