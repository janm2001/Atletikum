import {
  Badge,
  Button,
  Center,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import FriendCard from "./FriendCard";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useMyFriends, usePendingRequests, useRemoveFriend } from "@/hooks/useFriends";

interface FriendsManagementSectionProps {
  onOpenAddModal: () => void;
  onOpenRequestsPanel: () => void;
}

const FriendsManagementSection = ({
  onOpenAddModal,
  onOpenRequestsPanel,
}: FriendsManagementSectionProps) => {
  const { data: friends = [], isLoading } = useMyFriends();
  const { data: pendingRequests } = usePendingRequests();
  const removeFriend = useRemoveFriend();

  const incomingCount = pendingRequests?.incoming?.length ?? 0;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm" align="center">
          <Text fw={700} size="lg">
            Moji prijatelji
          </Text>
          {!isLoading && (
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
            onClick={onOpenRequestsPanel}
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
            onClick={onOpenAddModal}
          >
            Dodaj prijatelja
          </Button>
        </Group>
      </Group>

      {isLoading ? (
        <SpinnerComponent size="md" fullHeight={false} />
      ) : friends.length === 0 ? (
        <Center py="md">
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
              onRemove={(id) => removeFriend.mutate(id)}
              removing={
                removeFriend.isPending &&
                removeFriend.variables === entry.friendshipId
              }
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
};

export default FriendsManagementSection;
