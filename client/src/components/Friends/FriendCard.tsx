import { Avatar, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import type { FriendEntry } from "@/types/Friend/friend";

interface FriendCardProps {
  entry: FriendEntry;
  onRemove: (friendshipId: string) => void;
  removing: boolean;
}

const FriendCard = ({ entry, onRemove, removing }: FriendCardProps) => {
  const { friend, friendshipId } = entry;

  return (
    <Card withBorder radius="md" shadow="sm" p="md">
      <Stack gap="sm" align="center">
        <Avatar size={56} radius="xl" color="violet" name={friend.username}>
          {friend.username.charAt(0).toUpperCase()}
        </Avatar>
        <Stack gap={4} align="center">
          <Text fw={600} size="sm" ta="center" lineClamp={1}>
            {friend.username}
          </Text>
          <Badge size="sm" variant="light" color="violet">
            Razina {friend.level}
          </Badge>
          <Group gap={4} align="center">
            <Text size="xs">🔥</Text>
            <Text size="xs" c="dimmed">
              {friend.dailyStreak}
            </Text>
          </Group>
        </Stack>
        <Button
          size="xs"
          variant="light"
          color="red"
          fullWidth
          loading={removing}
          onClick={() => onRemove(friendshipId)}
        >
          Ukloni
        </Button>
      </Stack>
    </Card>
  );
};

export default FriendCard;
