import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { NewAchievement } from "@/types/Achievement/achievement";

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
          <Card
            key={ach._id}
            withBorder
            radius="md"
            p="md"
            w="100%"
            style={{
              borderColor: "var(--mantine-color-yellow-5)",
              backgroundColor: "var(--mantine-color-yellow-light)",
            }}
          >
            <Group justify="space-between">
              <div>
                <Text fw={700}>{ach.title}</Text>
                <Text size="sm" c="dimmed">
                  {ach.description}
                </Text>
              </div>
              <Badge color="yellow" variant="filled">
                +{ach.xpReward} XP
              </Badge>
            </Group>
          </Card>
        ))}
      </Stack>
    </Card>
  );
};

export default CelebrationAchievementsCard;
