import { Badge, Card, Group } from "@mantine/core";
import { IconCrown, IconMedal } from "@tabler/icons-react";
import type { LeaderboardUser } from "@/hooks/useLeaderboard";
import LeaderboardUserProfile from "./LeaderboardUserProfile";

const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32"] as const;
const podiumIcons = [
  <IconCrown key="1" size={28} color={podiumColors[0]} />,
  <IconMedal key="2" size={24} color={podiumColors[1]} />,
  <IconMedal key="3" size={24} color={podiumColors[2]} />,
];
const podiumOrder = [1, 0, 2] as const;

type LeaderboardPodiumProps = {
  entries: LeaderboardUser[];
  currentUserId?: string;
};

const LeaderboardPodium = ({
  entries,
  currentUserId,
}: LeaderboardPodiumProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Group justify="center" align="flex-end" gap="lg" mb="xl">
      {podiumOrder.map((position) => {
        const entry = entries[position];

        if (!entry) {
          return null;
        }

        const isCurrentUser = entry._id === currentUserId;
        const height = position === 0 ? 210 : position === 1 ? 180 : 150;

        return (
          <Card
            key={entry._id}
            withBorder
            radius="md"
            shadow={position === 0 ? "lg" : "sm"}
            p="md"
            w={{ base: 110, sm: 140 }}
            style={{
              height,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: isCurrentUser
                ? "2px solid var(--mantine-color-violet-5)"
                : position === 0
                  ? `2px solid ${podiumColors[0]}`
                  : undefined,
            }}
          >
            {podiumIcons[position]}
            <LeaderboardUserProfile
              entry={entry}
              isCurrentUser={isCurrentUser}
              avatarSize={position === 0 ? 52 : 40}
              layout="column"
              levelVariant="text"
              usernameSize="sm"
            />
            <Badge size="sm" variant="light" color="violet" mt={4}>
              {entry.totalXp} XP
            </Badge>
          </Card>
        );
      })}
    </Group>
  );
};

export default LeaderboardPodium;
