import { Card, Group, Text, Badge } from "@mantine/core";
import { IconArrowUp, IconBolt } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { NextRankUser } from "@/types/Leaderboard/leaderboardApi";

type LeaderboardChaseCardProps = {
  nextRankUser: NextRankUser;
  xpGap: number;
};

const LeaderboardChaseCard = ({
  nextRankUser,
  xpGap,
}: LeaderboardChaseCardProps) => {
  const { t } = useTranslation();

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      mb="lg"
      style={{
        borderColor: "var(--mantine-color-violet-4)",
        background:
          "linear-gradient(135deg, var(--mantine-color-violet-light) 0%, var(--mantine-color-indigo-light) 100%)",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <IconArrowUp size={20} color="var(--mantine-color-violet-6)" />
          <div>
            <Text size="sm" fw={600}>
              {t("leaderboard.chase.behind", {
                xp: xpGap,
                username: nextRankUser.username,
              })}
            </Text>
            <Text size="xs" c="dimmed">
              {t("leaderboard.chase.cta")}
            </Text>
          </div>
        </Group>
        <Badge
          size="lg"
          variant="light"
          color="violet"
          leftSection={<IconBolt size={14} />}
        >
          {xpGap} XP
        </Badge>
      </Group>
    </Card>
  );
};

export default LeaderboardChaseCard;
