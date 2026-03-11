import React from "react";
import { Button, Paper, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

interface ProfileSecurityProps {
  user: User;
}

const ProfileSecurity = ({ user }: ProfileSecurityProps) => {
  const navigate = useNavigate();

  return (
    <Paper withBorder radius="md" p="lg" w="100%" maw={520}>
      <Stack gap="xs">
        <Title order={3}>Sigurnost računa</Title>
        <Text fw={600}>Korisničko ime: {user?.username}</Text>
        <Text fw={600}>
          Email: {user?.email || "Email još nije postavljen"}
        </Text>
        <Button
          mt="sm"
          variant="light"
          onClick={() =>
            navigate("/zaboravljena-lozinka", {
              state: {
                username: user?.username,
                email: user?.email,
              },
            })
          }
        >
          Resetiraj lozinku
        </Button>
      </Stack>
    </Paper>
  );
};

export default ProfileSecurity;
