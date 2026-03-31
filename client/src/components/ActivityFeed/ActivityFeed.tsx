import { useState } from "react";
import {
  Button,
  Card,
  Center,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useActivityFeed } from "@/hooks/useActivity";
import { useUser } from "@/hooks/useUser";
import ActivityCard from "./ActivityCard";

const ActivityFeed = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useActivityFeed(page);
  const { user } = useUser();

  const events = data?.events ?? [];
  const hasMore = data?.hasMore ?? false;

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="md" color="violet" type="dots" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Card radius="md" p="md">
        <Center>
          <Stack align="center" gap="xs">
            <IconAlertCircle size={24} color="var(--mantine-color-red-5)" />
            <Text c="red" size="sm">
              Greška pri učitavanju aktivnosti.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      <Title order={4}>Aktivnost prijatelja</Title>

      {events.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Text size="xl">👥</Text>
            <Text c="dimmed" ta="center" size="sm">
              Nema aktivnosti. Dodaj prijatelje da vidiš njihovu aktivnost!
            </Text>
          </Stack>
        </Center>
      ) : (
        <>
          <Stack gap="sm">
            {events.map((event) => (
              <ActivityCard
                key={event._id}
                event={event}
                currentUserId={user?._id ?? ""}
              />
            ))}
          </Stack>

          {hasMore && (
            <Center>
              <Button
                variant="light"
                color="violet"
                onClick={() => setPage((prev) => prev + 1)}
              >
                Učitaj više
              </Button>
            </Center>
          )}
        </>
      )}
    </Stack>
  );
};

export default ActivityFeed;
