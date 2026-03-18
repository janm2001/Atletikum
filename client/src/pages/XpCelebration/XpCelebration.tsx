import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Center,
  Container,
  Group,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import {
  getLevelFromTotalXp,
  getXpRequiredForLevelUp,
  getTotalXpForLevelStart,
} from "../../utils/leveling";
import { useTranslation } from "react-i18next";
import type { CelebrationState } from "@/types/Celebration/celebration";
import {
  clearPersistedCelebrationState,
  getPersistedCelebrationState,
  persistCelebrationState,
} from "@/utils/flowSessionStorage";
import CelebrationHeader from "./CelebrationHeader";
import CelebrationXpCard from "./CelebrationXpCard";
import CelebrationLevelCard from "./CelebrationLevelCard";
import CelebrationAchievementsCard from "./CelebrationAchievementsCard";
import CelebrationPersonalBestsCard from "./CelebrationPersonalBestsCard";
import CelebrationWhatsNextCard from "./CelebrationWhatsNextCard";

const XpCelebration = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as CelebrationState | null;
  const state = routeState ?? getPersistedCelebrationState();

  const [showXp, setShowXp] = useState(false);
  const [showLevel, setShowLevel] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!routeState) {
      return;
    }

    persistCelebrationState(routeState);
  }, [routeState]);

  useEffect(() => {
    if (!state) return;

    const timers = [
      setTimeout(() => setShowXp(true), 300),
      setTimeout(() => setShowLevel(true), 800),
      setTimeout(() => setShowAchievements(true), 1300),
      setTimeout(() => setShowActions(true), 1800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [state]);

  if (!state) {
    return (
      <Center style={{ height: "calc(100vh - 100px)" }}>
        <Stack align="center" gap="md">
          <Text c="dimmed">{t("celebration.noData")}</Text>
          <Button onClick={() => navigate("/pregled")}>
            {t("common.back")}
          </Button>
        </Stack>
      </Center>
    );
  }

  const isQuiz = state.type === "quiz";
  const level = state.level ?? getLevelFromTotalXp(state.totalXp ?? 0);
  const totalXp = state.totalXp ?? 0;
  const levelStartXp = getTotalXpForLevelStart(level);
  const xpForNextLevel = getXpRequiredForLevelUp(level);
  const xpInCurrentLevel = totalXp - levelStartXp;
  const progressPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpForNextLevel) * 100),
  );

  const achievements = state.newAchievements ?? [];
  const personalBests = state.personalBests ?? [];
  const backPath = isQuiz ? "/edukacija" : "/zapis-treninga";
  const handleNavigateAway = (path: string) => {
    clearPersistedCelebrationState();
    navigate(path);
  };

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="xl">
        <Transition mounted={showXp} transition="slide-down" duration={500}>
          {(transitionStyles) => (
            <div style={transitionStyles}>
              <CelebrationHeader isQuiz={isQuiz} title={state.title} />
            </div>
          )}
        </Transition>

        <Transition mounted={showXp} transition="scale" duration={600}>
          {(transitionStyles) => (
            <div style={{ ...transitionStyles, width: "100%" }}>
              <CelebrationXpCard
                isQuiz={isQuiz}
                xpGained={state.xpGained}
                score={state.score}
                totalQuestions={state.totalQuestions}
                brainXp={state.brainXp}
                bodyXp={state.bodyXp}
              />
            </div>
          )}
        </Transition>

        <Transition mounted={showLevel} transition="scale" duration={600}>
          {(transitionStyles) => (
            <div style={{ ...transitionStyles, width: "100%" }}>
              <CelebrationLevelCard
                level={level}
                xpInCurrentLevel={xpInCurrentLevel}
                xpForNextLevel={xpForNextLevel}
                progressPercent={progressPercent}
                totalXp={totalXp}
              />
            </div>
          )}
        </Transition>

        {achievements.length > 0 && (
          <Transition
            mounted={showAchievements}
            transition="slide-up"
            duration={500}
          >
            {(transitionStyles) => (
              <div style={{ ...transitionStyles, width: "100%" }}>
                <CelebrationAchievementsCard achievements={achievements} />
              </div>
            )}
          </Transition>
        )}

        {!isQuiz && personalBests.length > 0 && (
          <Transition
            mounted={showAchievements}
            transition="slide-up"
            duration={500}
          >
            {(transitionStyles) => (
              <div style={{ ...transitionStyles, width: "100%" }}>
                <CelebrationPersonalBestsCard personalBests={personalBests} />
              </div>
            )}
          </Transition>
        )}

        <Transition mounted={showActions} transition="slide-up" duration={500}>
          {(transitionStyles) => (
            <div style={{ ...transitionStyles, width: "100%" }}>
              <CelebrationWhatsNextCard
                isQuiz={isQuiz}
                xpRemaining={xpForNextLevel - xpInCurrentLevel}
                nextLevel={level + 1}
                onNavigate={handleNavigateAway}
              />
            </div>
          )}
        </Transition>

        <Transition mounted={showActions} transition="fade" duration={400}>
          {(transitionStyles) => (
            <Group gap="md" style={transitionStyles}>
              <Button
                variant="light"
                onClick={() => handleNavigateAway(backPath)}
              >
                {isQuiz
                  ? t("celebration.backToEducation")
                  : t("celebration.backToWorkouts")}
              </Button>
              <Button
                rightSection={<IconArrowRight size={16} />}
                onClick={() => handleNavigateAway("/pregled")}
              >
                {t("celebration.backToOverview")}
              </Button>
            </Group>
          )}
        </Transition>
      </Stack>
    </Container>
  );
};

export default XpCelebration;
