import { Badge, Group, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconTrophy } from "@tabler/icons-react";

type LeaderboardHeaderProps = {
  myRank: number | null;
};

const LeaderboardHeader = ({ myRank }: LeaderboardHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Group justify="space-between" align="flex-end" mb="xl">
      <div>
        <Title order={1} mb="xs">
          <IconTrophy
            size={32}
            style={{ verticalAlign: "middle", marginRight: 8 }}
            color="var(--mantine-color-yellow-5)"
          />
          {t('leaderboard.title')}
        </Title>
        <Text c="dimmed">{t('leaderboard.subtitle')}</Text>
      </div>
      {myRank && (
        <Badge size="lg" variant="light" color="violet">
          {t('leaderboard.yourRank', { rank: myRank })}
        </Badge>
      )}
    </Group>
  );
};

export default LeaderboardHeader;
