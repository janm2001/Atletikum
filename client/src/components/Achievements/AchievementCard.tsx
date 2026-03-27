import { memo } from "react";
import {
  Card,
  Badge,
  Text,
  Tooltip,
  Stack,
  Group,
  Progress,
  ThemeIcon,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconLock, IconCheck } from "@tabler/icons-react";
import type { Achievement } from "../../types/Achievement/achievement";
import {
  achievementBadgeIconMap,
  DEFAULT_ACHIEVEMENT_BADGE_ICON,
} from "./achievementBadgeIcons";

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard = memo(({ achievement }: AchievementCardProps) => {
  const { t } = useTranslation();
  const BadgeIcon =
    achievementBadgeIconMap[achievement.badgeIcon] ||
    DEFAULT_ACHIEVEMENT_BADGE_ICON;

  const progress = achievement.progress;
  const isAlmostUnlocked =
    !achievement.isUnlocked && progress && progress.progressPercent >= 75;

  return (
    <Tooltip
      label={
        <Stack gap={4}>
          <Text size="sm" fw={600}>
            {achievement.title}
          </Text>
          <Text size="xs">{achievement.description}</Text>
          <Text size="xs" c="teal">
            +{achievement.xpReward} XP
          </Text>
          {achievement.isUnlocked && achievement.unlockedAt && (
            <Text size="xs" c="dimmed">
              {t("achievements.unlockedAt")}{" "}
              {new Date(achievement.unlockedAt).toLocaleDateString("hr-HR")}
            </Text>
          )}
          {!achievement.isUnlocked && progress && (
            <Text size="xs" c="dimmed">
              {t("achievements.progress", {
                current: progress.current,
                required: progress.required,
              })}
            </Text>
          )}
        </Stack>
      }
      withArrow
      multiline
      w={220}
    >
      <Card
        withBorder
        radius="md"
        p="sm"
        style={{
          opacity: achievement.isUnlocked ? 1 : isAlmostUnlocked ? 0.85 : 0.4,
          filter: achievement.isUnlocked
            ? "none"
            : isAlmostUnlocked
              ? "none"
              : "grayscale(100%)",
          transition: "all 0.2s ease",
          cursor: "pointer",
          border: isAlmostUnlocked
            ? "2px solid var(--mantine-color-yellow-5)"
            : undefined,
        }}
      >
        <Stack align="center" gap="xs">
          <ThemeIcon
            size={56}
            radius="xl"
            variant={achievement.isUnlocked ? "light" : "subtle"}
            color={
              isAlmostUnlocked
                ? "yellow"
                : achievement.isUnlocked
                  ? "teal"
                  : "gray"
            }
          >
            <BadgeIcon size={32} stroke={1.8} />
          </ThemeIcon>
          <Text size="xs" fw={600} ta="center" lineClamp={2}>
            {achievement.title}
          </Text>
          {achievement.isUnlocked ? (
            <Group gap={4}>
              <IconCheck size={14} color="var(--mantine-color-teal-6)" />
              <Badge size="xs" color="teal" variant="light">
                +{achievement.xpReward} XP
              </Badge>
            </Group>
          ) : (
            <Stack gap={4} w="100%">
              {progress && (
                <>
                  <Progress
                    value={progress.progressPercent}
                    size="sm"
                    color={isAlmostUnlocked ? "yellow" : "violet"}
                    radius="xl"
                  />
                  <Text size="xs" ta="center" c="dimmed">
                    {progress.current}/{progress.required}
                  </Text>
                </>
              )}
              {!progress && (
                <Group gap={4} justify="center">
                  <IconLock size={14} color="var(--mantine-color-gray-5)" />
                  <Badge size="xs" color="gray" variant="light">
                    {t("achievements.locked")}
                  </Badge>
                </Group>
              )}
              {isAlmostUnlocked && (
                <Badge size="xs" color="yellow" variant="light" mx="auto">
                  {t("achievements.almostUnlocked")}
                </Badge>
              )}
            </Stack>
          )}
        </Stack>
      </Card>
    </Tooltip>
  );
});
