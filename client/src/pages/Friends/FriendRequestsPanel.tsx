import {
  Avatar,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { useAcceptFriendRequest, usePendingRequests, useRemoveFriend } from "@/hooks/useFriends";
import type { FriendRequest } from "@/types/Friend/friend";

interface FriendRequestsProps {
  opened: boolean;
  onClose: () => void;
}

interface RequestRowProps {
  request: FriendRequest;
  actionLabel: string;
  actionColor: string;
  onAction: (friendshipId: string) => void;
  isLoading: boolean;
}

const RequestRow = ({
  request,
  actionLabel,
  actionColor,
  onAction,
  isLoading,
}: RequestRowProps) => {
  const { user, friendshipId } = request;

  return (
    <Group justify="space-between" wrap="nowrap" gap="sm">
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <Avatar size={40} radius="xl" color="violet" name={user.username}>
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text fw={600} size="sm" lineClamp={1}>
            {user.username}
          </Text>
          <Badge size="xs" variant="light" color="violet">
            Razina {user.level}
          </Badge>
        </Stack>
      </Group>
      <Button
        size="xs"
        variant="light"
        color={actionColor}
        onClick={() => onAction(friendshipId)}
        loading={isLoading}
        style={{ flexShrink: 0 }}
      >
        {actionLabel}
      </Button>
    </Group>
  );
};

const FriendRequestsPanel = ({ opened, onClose }: FriendRequestsProps) => {
  const { data: pendingRequests, isLoading } = usePendingRequests();
  const acceptRequest = useAcceptFriendRequest();
  const removeFriend = useRemoveFriend();

  const incoming = pendingRequests?.incoming ?? [];
  const outgoing = pendingRequests?.outgoing ?? [];

  const handleAccept = (friendshipId: string) => {
    acceptRequest.mutate(friendshipId);
  };

  const handleCancel = (friendshipId: string) => {
    removeFriend.mutate(friendshipId);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Zahtjevi za prijateljstvo"
      centered
      size="sm"
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Text size="sm" fw={700} tt="uppercase" c="dimmed">
            Primljeni zahtjevi
          </Text>

          {!isLoading && incoming.length === 0 ? (
            <Center py="sm">
              <Text size="sm" c="dimmed">
                Nema primljenih zahtjeva.
              </Text>
            </Center>
          ) : (
            <Stack gap="sm">
              {incoming.map((request: FriendRequest) => (
                <RequestRow
                  key={request.friendshipId}
                  request={request}
                  actionLabel="Prihvati"
                  actionColor="green"
                  onAction={handleAccept}
                  isLoading={
                    acceptRequest.isPending &&
                    acceptRequest.variables === request.friendshipId
                  }
                />
              ))}
            </Stack>
          )}
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Text size="sm" fw={700} tt="uppercase" c="dimmed">
            Poslani zahtjevi
          </Text>

          {!isLoading && outgoing.length === 0 ? (
            <Center py="sm">
              <Text size="sm" c="dimmed">
                Nema poslanih zahtjeva.
              </Text>
            </Center>
          ) : (
            <Stack gap="sm">
              {outgoing.map((request: FriendRequest) => (
                <RequestRow
                  key={request.friendshipId}
                  request={request}
                  actionLabel="Otkaži"
                  actionColor="red"
                  onAction={handleCancel}
                  isLoading={
                    removeFriend.isPending &&
                    removeFriend.variables === request.friendshipId
                  }
                />
              ))}
            </Stack>
          )}
        </Stack>

        <Button variant="default" fullWidth onClick={onClose}>
          Zatvori
        </Button>
      </Stack>
    </Modal>
  );
};

export default FriendRequestsPanel;
