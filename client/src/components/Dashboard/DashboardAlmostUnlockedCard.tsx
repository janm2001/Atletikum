import {
  Anchor,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconTargetArrow } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Achievement } from "@/types/Achievement/achievement";

interface DashboardAlmostUnlockedCardProps {
  achievements: Achievement[];
}

const DashboardAlmostUnlockedCard = ({
  achievements,
}: DashboardAlmostUnlockedCardProps) => {
  const { t } = useTranslation();

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Group gap="sm" mb="md">
        <ThemeIcon size="sm" radius="sm" color="yellow" variant="light">
          <IconTargetArrow size={14} />
        </ThemeIcon>
        <Title order={4}>{t("dashboard.almostUnlocked.title")}</Title>
      </Group>

      <Stack gap="sm">
        {achievements.map((a) => (
          <Stack key={a._id} gap={4}>
            <Group justify="space-between">
              <Text size="sm" fw={500} lineClamp={1}>
                {a.title}
              </Text>
              <Text size="xs" c="dimmed">
                {a.progress?.progressPercent}%
              </Text>
            </Group>
            <Progress
              value={a.progress?.progressPercent ?? 0}
              color="yellow"
              radius="xl"
              size="sm"
            />
            <Text size="xs" c="dimmed">
              {t("achievements.progress", {
                current: a.progress?.current,
                required: a.progress?.required,
              })}
            </Text>
          </Stack>
        ))}
      </Stack>

      <Group justify="flex-end" mt="sm">
        <Anchor component={Link} to="/profil" size="xs" c="dimmed">
          {t("dashboard.almostUnlocked.viewAll")}
        </Anchor>
      </Group>
    </Card>
  );
};

export default DashboardAlmostUnlockedCard;
