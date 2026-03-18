import { Card, Center, RingProgress, Stack, Text } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface CelebrationLevelCardProps {
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  totalXp: number;
}

const CelebrationLevelCard = ({
  level,
  xpInCurrentLevel,
  xpForNextLevel,
  progressPercent,
  totalXp,
}: CelebrationLevelCardProps) => {
  const { t } = useTranslation();

  return (
    <Card withBorder radius="lg" shadow="sm" p="xl" w="100%">
      <Stack align="center" gap="sm">
        <RingProgress
          size={120}
          thickness={10}
          roundCaps
          sections={[{ value: progressPercent, color: "violet" }]}
          label={
            <Center>
              <Stack gap={0} align="center">
                <IconStar size={20} color="var(--mantine-color-yellow-5)" />
                <Text fw={700} size="lg">
                  {level}
                </Text>
              </Stack>
            </Center>
          }
        />
        <Text size="sm" c="dimmed">
          {t("celebration.levelLabel", { level })}
        </Text>
        <Text size="xs" c="dimmed">
          {t("celebration.xpToNextLevel", {
            current: xpInCurrentLevel,
            total: xpForNextLevel,
          })}
        </Text>
        <Text size="lg" fw={700}>
          {t("celebration.totalXp", { xp: totalXp })}
        </Text>
      </Stack>
    </Card>
  );
};

export default CelebrationLevelCard;
