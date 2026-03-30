import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import { useMyFriends, usePendingRequests, useRemoveFriend } from "@/hooks/useFriends";
import type { FriendEntry } from "@/types/Friend/friend";
import AddFriendModal from "./AddFriendModal";
import FriendRequestsPanel from "./FriendRequestsPanel";

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

const FriendsList = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [requestsPanelOpen, setRequestsPanelOpen] = useState(false);

  const { data: friends = [], isLoading: friendsLoading } = useMyFriends();
  const { data: pendingRequests } = usePendingRequests();
  const removeFriend = useRemoveFriend();

  const incomingCount = pendingRequests?.incoming?.length ?? 0;

  const handleRemove = (friendshipId: string) => {
    removeFriend.mutate(friendshipId);
  };

  return (
    <Container size="xl" py={{ base: "sm", md: "md" }}>
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="sm" align="center">
            <Title order={2}>Prijatelji</Title>
            {!friendsLoading && (
              <Badge size="lg" variant="light" color="violet">
                {friends.length}
              </Badge>
            )}
          </Group>
          <Group gap="sm">
            <Button
              leftSection={<IconUsers size={16} />}
              variant="light"
              color="violet"
              onClick={() => setRequestsPanelOpen(true)}
              rightSection={
                incomingCount > 0 ? (
                  <Badge size="xs" circle color="red" variant="filled">
                    {incomingCount}
                  </Badge>
                ) : undefined
              }
            >
              Zahtjevi
            </Button>
            <Button
              leftSection={<IconUserPlus size={16} />}
              color="violet"
              onClick={() => setAddModalOpen(true)}
            >
              Dodaj prijatelja
            </Button>
          </Group>
        </Group>

        {!friendsLoading && friends.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Text size="xl">👥</Text>
              <Text c="dimmed" ta="center">
                Još nema prijatelja. Dodaj prvog prijatelja!
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
            {friends.map((entry) => (
              <FriendCard
                key={entry.friendshipId}
                entry={entry}
                onRemove={handleRemove}
                removing={removeFriend.isPending && removeFriend.variables === entry.friendshipId}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>

      <AddFriendModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      <FriendRequestsPanel
        opened={requestsPanelOpen}
        onClose={() => setRequestsPanelOpen(false)}
      />
    </Container>
  );
};

export default FriendsList;
