import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { NewAchievement } from "@/types/Achievement/achievement";
import CelebrationItemCard from "./CelebrationItemCard";

interface CelebrationAchievementsCardProps {
  achievements: NewAchievement[];
}

const CelebrationAchievementsCard = ({
  achievements,
}: CelebrationAchievementsCardProps) => {
  const { t } = useTranslation();

  if (achievements.length === 0) return null;

  return (
    <Card withBorder radius="lg" shadow="sm" p="xl" w="100%">
      <Stack align="center" gap="md">
        <Group gap="xs">
          <IconTrophy size={24} color="var(--mantine-color-yellow-5)" />
          <Title order={3}>{t("celebration.newAchievements")}</Title>
        </Group>

        {achievements.map((ach) => (
          <CelebrationItemCard key={ach._id} accentColor="yellow">
            <div>
              <Text fw={700}>{ach.title}</Text>
              <Text size="sm" c="dimmed">
                {ach.description}
              </Text>
            </div>
            <Badge color="yellow" variant="filled">
              {t("common.xpGained", { count: ach.xpReward })}
            </Badge>
          </CelebrationItemCard>
        ))}
      </Stack>
    </Card>
  );
};

export default CelebrationAchievementsCard;
