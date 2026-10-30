import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import ProfileHeader from "@/components/Profile/ProfileHeader/ProfileHeader";

const Profile = () => {
  const { user } = useUser();

  return (
    <Container size="lg" py={{ base: "sm", md: "md" }}>
      <Stack gap="md">
        <ProfileHeader user={user} />

        <Card withBorder radius="lg" p="xl"><Stack><Title order={2}>Tvoj napredak ostaje tvoj.</Title><Text c="dimmed">Uči svojim tempom. Naučene lekcije ostaju spremljene i kad odmaraš.</Text><Button component={Link} to="/moj-put" color="violet">Otvori moj put</Button></Stack></Card>
      </Stack>
    </Container>
  );
};

export default Profile;
