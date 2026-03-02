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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../../schema/login.schema";
import { useLogin } from "../../hooks/useAuth";

const Login = () => {
  const [error, setError] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (formData: LoginInput) => {
    setError("");

    try {
      const response = await loginMutation.mutateAsync(formData);

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
          <form onSubmit={handleSubmit(handleLogin)}>
            <TextInput
              label="Korisničko ime"
              placeholder="Vaše korisničko ime"
              required
              error={errors.username?.message}
              {...register("username")}
            />
            <PasswordInput
              label="Lozinka"
              placeholder="Vaša lozinka"
              required
              mt="md"
              error={errors.password?.message}
              {...register("password")}
            />

            {error && (
              <Text c="red" size="sm" mt="sm">
                {error}
              </Text>
            )}

            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={isSubmitting || loginMutation.isPending}
            >
              Prijavi se
            </Button>
          </form>
        </Paper>
      </div>
    </Flex>
  );
};

export default Login;
