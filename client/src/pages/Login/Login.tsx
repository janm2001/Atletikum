import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Group,
  Box,
  Stack,
} from "@mantine/core";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../../schema/login.schema";
import { useLogin } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { IconBarbell } from "@tabler/icons-react";

const Login = () => {
  const { t } = useTranslation();
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
        setError(t("auth.login.error"));
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("auth.login.serverError"),
      );
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Box
        visibleFrom="md"
        style={{
          flex: "0 0 45%",
          background: "linear-gradient(135deg, var(--mantine-color-violet-9) 0%, var(--mantine-color-violet-6) 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "var(--mantine-spacing-xl)",
        }}
      >
        <IconBarbell size={64} color="white" stroke={1.5} />
        <Title order={1} c="white" mt="md">
          Atletikum
        </Title>
        <Text c="white" opacity={0.85} size="lg" ta="center" mt="sm" maw={320}>
          {t("dashboard.welcome")}
        </Text>
      </Box>

      <Box
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "var(--mantine-spacing-xl)",
        }}
      >
        <Stack w="100%" maw={420}>
          <Box hiddenFrom="md" ta="center" mb="md">
            <IconBarbell size={40} color="var(--mantine-color-violet-6)" stroke={1.5} />
            <Title order={2} mt="xs">Atletikum</Title>
          </Box>

          <Title ta="center" order={2}>
            {t("auth.login.title")}
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            {t("auth.login.noAccount")}{" "}
            <Anchor component={Link} to="/register" size="sm">
              {t("auth.login.register")}
            </Anchor>
          </Text>

          <Paper withBorder shadow="md" p={30} mt="sm" radius="md">
            <form onSubmit={handleSubmit(handleLogin)}>
              <TextInput
                label={t("auth.login.username")}
                placeholder={t("auth.login.usernamePlaceholder")}
                required
                error={errors.username?.message}
                {...register("username")}
              />
              <PasswordInput
                label={t("auth.login.password")}
                placeholder={t("auth.login.passwordPlaceholder")}
                required
                mt="md"
                error={errors.password?.message}
                {...register("password")}
              />

              <Group justify="flex-end" mt="xs">
                <Anchor component={Link} to="/zaboravljena-lozinka" size="sm">
                  {t("auth.login.forgotPassword")}
                </Anchor>
              </Group>

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
                {t("auth.login.submit")}
              </Button>
            </form>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export default Login;
