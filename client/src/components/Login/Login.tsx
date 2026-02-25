import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Flex,
} from "@mantine/core";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { apiService } from "../../utils/apiService";
import type { User } from "../../types/User/user";

interface LoginResponse {
  user: User;
}

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await apiService.post<LoginResponse>("auth/login", {
        username,
        password,
      });

      if (response.status === "success" && response.data && response.token) {
        login(response.data.user, response.token);
        navigate("/");
      } else {
        setError("Prijava nije uspjela. Provjerite podatke.");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Došlo je do greške na serveru.",
      );
    }
  };

  return (
    <Flex
      justify="center"
      align="center"
      mih="100vh"
      direction="column"
      w="100%"
    >
      <div style={{ width: "100%", maxWidth: 500 }}>
        <Title ta="center" order={2}>
          Dobrodošli natrag!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Nemate račun?{" "}
          <Anchor component={Link} to="/register" size="sm">
            Registrirajte se
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleLogin}>
            <TextInput
              label="Korisničko ime"
              placeholder="Vaše korisničko ime"
              required
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
            />
            <PasswordInput
              label="Lozinka"
              placeholder="Vaša lozinka"
              required
              mt="md"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />

            {error && (
              <Text c="red" size="sm" mt="sm">
                {error}
              </Text>
            )}

            <Button fullWidth mt="xl" type="submit">
              Prijavi se
            </Button>
          </form>
        </Paper>
      </div>
    </Flex>
  );
};

export default Login;
