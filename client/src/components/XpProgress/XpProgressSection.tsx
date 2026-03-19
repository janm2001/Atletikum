import { Badge, Card, Group, Progress, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconBrain, IconBarbell } from "@tabler/icons-react";
import { useUser } from "../../hooks/useUser";
import {
  getLevelFromTotalXp,
  getXpProgress,
} from "../../utils/leveling";

interface XpProgressSectionProps {
  variant?: "full" | "brain" | "body";
}

export const XpProgressSection = ({
  variant = "full",
}: XpProgressSectionProps) => {
  const { t } = useTranslation();
  const { user } = useUser();
  if (!user) return null;

  const level = getLevelFromTotalXp(user.totalXp);
  const { xpInLevel, xpForNext, percent: levelPercent } = getXpProgress(level, user.totalXp);

  const showBrain = variant === "full" || variant === "brain";
  const showBody = variant === "full" || variant === "body";

  return (
    <Card withBorder radius="md" shadow="sm" p="md" w="100%">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600}>
            {t('xpProgress.level', { level })}
          </Text>
          <Badge variant="light" color="violet" size="sm">
            {t('xpProgress.progress', { current: xpInLevel, total: xpForNext, level: level + 1 })}
          </Badge>
        </Group>
        <Progress value={levelPercent} color="violet" radius="xl" size="sm" />

        <Group grow gap="md" mt={4}>
          {showBrain && (
            <Stack gap={4}>
              <Group gap={6}>
                <IconBrain size={16} color="var(--mantine-color-blue-5)" />
                <Text size="xs" fw={500} c="blue">
                  {t('xpProgress.brain')}
                </Text>
                <Text size="xs" c="dimmed" ml="auto">
                  {t('common.xpAmount', { count: user.brainXp })}
                </Text>
              </Group>
              <Progress
                value={
                  user.totalXp > 0
                    ? Math.round((user.brainXp / user.totalXp) * 100)
                    : 0
                }
                color="blue"
                radius="xl"
                size="xs"
              />
            </Stack>
          )}

          {showBody && (
            <Stack gap={4}>
              <Group gap={6}>
                <IconBarbell size={16} color="var(--mantine-color-violet-5)" />
                <Text size="xs" fw={500} c="violet">
                  {t('xpProgress.body')}
                </Text>
                <Text size="xs" c="dimmed" ml="auto">
                  {t('common.xpAmount', { count: user.bodyXp })}
                </Text>
              </Group>
              <Progress
                value={
                  user.totalXp > 0
                    ? Math.round((user.bodyXp / user.totalXp) * 100)
                    : 0
                }
                color="violet"
                radius="xl"
                size="xs"
              />
            </Stack>
          )}
        </Group>
      </Stack>
    </Card>
  );
};
