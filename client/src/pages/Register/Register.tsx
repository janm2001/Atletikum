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
  Select,
  Slider,
  Group,
  Badge,
} from "@mantine/core";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { apiService } from "../../utils/apiService";
import type { User } from "../../types/User/user";
import { TRAINING_FOCUS_OPTIONS } from "../../enums/trainingFocus";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";

interface RegisterResponse {
  user: User;
}

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [trainingFrequency, setTrainingFrequency] = useState(3);
  const [focus, setFocus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password || !passwordConfirm) {
      setError("Molimo popunite sva polja.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Lozinke se ne poklapaju.");
      return;
    }

    if (password.length < 6) {
      setError("Lozinka mora biti najmanje 6 karaktera.");
      return;
    }

    if (!focus) {
      setError("Molimo odaberite fokus treninga.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post<RegisterResponse>(
        "auth/register",
        {
          username,
          password,
          trainingFrequency,
          focus,
        },
      );

      if (response.status === "success" && response.data && response.token) {
        login(response.data.user, response.token);
        navigate("/");
      } else {
        setError("Registracija nije uspjela. Pokušajte ponovno.");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Došlo je do greške na serveru.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SpinnerComponent />;
  }

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
          Kreirajte svoj račun
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Već imate račun?{" "}
          <Anchor component={Link} to="/login" size="sm">
            Prijavite se
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleRegister}>
            <TextInput
              label="Korisničko ime"
              placeholder="Odaberite korisničko ime"
              required
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              mb="md"
            />

            <PasswordInput
              label="Lozinka"
              placeholder="Unesite lozinku"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              mb="md"
            />

            <PasswordInput
              label="Potvrdi lozinku"
              placeholder="Potvrdi lozinku"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.currentTarget.value)}
              mb="md"
            />

            <Select
              label="Fokus treninga"
              placeholder="Odaberite fokus"
              data={TRAINING_FOCUS_OPTIONS}
              value={focus}
              onChange={setFocus}
              required
              mb="md"
            />

            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  Frekvencija treninga: {trainingFrequency}x tjedno
                </Text>
                <Badge color="violet" variant="dot">
                  {trainingFrequency}/7 dana
                </Badge>
              </Group>
              <Slider
                value={trainingFrequency}
                onChange={setTrainingFrequency}
                min={0}
                max={7}
                step={1}
                marks={[
                  { value: 0, label: "0" },
                  { value: 7, label: "7" },
                ]}
                mb="md"
              />
            </div>

            {error && (
              <Text c="red" size="sm" mt="sm" mb="md">
                {error}
              </Text>
            )}

            <Button fullWidth mt="xl" type="submit">
              Registrirajte se
            </Button>
          </form>
        </Paper>
      </div>
    </Flex>
  );
};

export default Register;
