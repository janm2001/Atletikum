import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconSearch, IconX } from "@tabler/icons-react";
import { useSendFriendRequest } from "@/hooks/useFriends";

interface AddFriendModalProps {
  opened: boolean;
  onClose: () => void;
}

const AddFriendModal = ({ opened, onClose }: AddFriendModalProps) => {
  const [username, setUsername] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sendRequest = useSendFriendRequest();

  const handleClose = () => {
    setUsername("");
    setSuccessMessage(null);
    sendRequest.reset();
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = username.trim();
    if (!trimmed) return;

    sendRequest.mutate(trimmed, {
      onSuccess: () => {
        setSuccessMessage(`Zahtjev je uspješno poslan korisniku "${trimmed}"!`);
        setUsername("");
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const errorMessage = sendRequest.error
    ? (sendRequest.error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Nije moguće poslati zahtjev. Provjeri korisničko ime."
    : null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Dodaj prijatelja"
      centered
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Upiši korisničko ime osobe kojoj želiš poslati zahtjev za prijateljstvo.
        </Text>

        <TextInput
          placeholder="Korisničko ime"
          leftSection={<IconSearch size={16} />}
          value={username}
          onChange={(e) => {
            setUsername(e.currentTarget.value);
            if (successMessage) setSuccessMessage(null);
            if (sendRequest.isError) sendRequest.reset();
          }}
          onKeyDown={handleKeyDown}
          disabled={sendRequest.isPending}
        />

        {successMessage && (
          <Alert
            color="green"
            icon={<IconCheck size={16} />}
            radius="md"
          >
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert
            color="red"
            icon={<IconX size={16} />}
            radius="md"
          >
            {errorMessage}
          </Alert>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={handleClose} disabled={sendRequest.isPending}>
            Zatvori
          </Button>
          <Button
            color="violet"
            onClick={handleSubmit}
            loading={sendRequest.isPending}
            disabled={!username.trim()}
          >
            Pošalji zahtjev
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AddFriendModal;
