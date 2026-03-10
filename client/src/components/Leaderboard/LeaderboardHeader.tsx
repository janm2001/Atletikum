import { Badge, Group, Text, Title } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";

type LeaderboardHeaderProps = {
  myRank: number | null;
};

const LeaderboardHeader = ({ myRank }: LeaderboardHeaderProps) => {
  return (
    <Group justify="space-between" align="flex-end" mb="xl">
      <div>
        <Title order={1} mb="xs">
          <IconTrophy
            size={32}
            style={{ verticalAlign: "middle", marginRight: 8 }}
            color="var(--mantine-color-yellow-5)"
          />
          Ljestvica
        </Title>
        <Text c="dimmed">Najbolji sportaši po ukupnim XP bodovima</Text>
      </div>
      {myRank && (
        <Badge size="lg" variant="light" color="violet">
          Vaš rang: #{myRank}
        </Badge>
      )}
    </Group>
  );
};

export default LeaderboardHeader;
