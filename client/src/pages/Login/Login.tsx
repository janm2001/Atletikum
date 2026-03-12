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
  Group,
} from "@mantine/core";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../../schema/login.schema";
import { useLogin } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

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
        setError(t('auth.login.error'));
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t('auth.login.serverError'),
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
          {t('auth.login.title')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {t('auth.login.noAccount')}{" "}
          <Anchor component={Link} to="/register" size="sm">
            {t('auth.login.register')}
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleSubmit(handleLogin)}>
            <TextInput
              label={t('auth.login.username')}
              placeholder={t('auth.login.usernamePlaceholder')}
              required
              error={errors.username?.message}
              {...register("username")}
            />
            <PasswordInput
              label={t('auth.login.password')}
              placeholder={t('auth.login.passwordPlaceholder')}
              required
              mt="md"
              error={errors.password?.message}
              {...register("password")}
            />

            <Group justify="flex-end" mt="xs">
              <Anchor component={Link} to="/zaboravljena-lozinka" size="sm">
                {t('auth.login.forgotPassword')}
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
              {t('auth.login.submit')}
            </Button>
          </form>
        </Paper>
      </div>
    </Flex>
  );
};

export default Login;
