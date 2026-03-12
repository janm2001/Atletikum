import { useState } from "react";
import {
  Anchor,
  Button,
  Flex,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schema/forgotPassword.schema";
import { useRequestPasswordReset } from "@/hooks/useAuth";
import type { PasswordResetRequestResponse } from "@/types/User/auth";
import { useTranslation } from "react-i18next";

type ForgotPasswordLocationState = {
  username?: string;
  email?: string;
} | null;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const locationState = location.state as ForgotPasswordLocationState;
  const requestResetMutation = useRequestPasswordReset();
  const [error, setError] = useState("");
  const [result, setResult] = useState<PasswordResetRequestResponse | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: locationState?.username ?? "",
      email: locationState?.email ?? "",
    },
  });

  const handleRequestReset = async (formData: ForgotPasswordInput) => {
    setError("");
    setResult(null);

    try {
      const response = await requestResetMutation.mutateAsync(formData);
      setResult(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t('common.serverError'),
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
      <div style={{ width: "100%", maxWidth: 520 }}>
        <Title ta="center" order={2}>
          {t('auth.forgotPassword.title')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {t('auth.forgotPassword.devNote')}
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleSubmit(handleRequestReset)}>
            <TextInput
              label={t('auth.forgotPassword.username')}
              placeholder={t('auth.forgotPassword.usernamePlaceholder')}
              required
              error={errors.username?.message}
              {...register("username")}
              mb="md"
            />

            <TextInput
              label={t('auth.forgotPassword.email')}
              placeholder={t('auth.forgotPassword.emailPlaceholder')}
              required
              error={errors.email?.message}
              {...register("email")}
            />

            {error && (
              <Text c="red" size="sm" mt="sm">
                {error}
              </Text>
            )}

            {result && (
              <Paper
                withBorder
                radius="md"
                p="md"
                mt="md"
                bg="var(--mantine-color-gray-0)"
              >
                <Text fw={600}>{t('auth.forgotPassword.successTitle')}</Text>
                <Text size="sm" c="dimmed" mt={4}>
                  {result.message}
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  {t('auth.forgotPassword.successDescription')}
                </Text>
              </Paper>
            )}

            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={isSubmitting || requestResetMutation.isPending}
            >
              {t('auth.forgotPassword.submit')}
            </Button>
          </form>

          <Text c="dimmed" size="sm" ta="center" mt="md">
            {t('auth.forgotPassword.backToLogin')}{" "}
            <Anchor component={Link} to="/login" size="sm">
              {t('auth.forgotPassword.loginLink')}
            </Anchor>
          </Text>
        </Paper>
      </div>
    </Flex>
  );
};

export default ForgotPassword;
