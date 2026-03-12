import { useState } from "react";
import {
  Anchor,
  Button,
  Flex,
  Paper,
  PasswordInput,
  Text,
  Title,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schema/resetPassword.schema";
import { useResetPassword } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const resetPasswordMutation = useResetPassword();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const handleResetPassword = async (formData: ResetPasswordInput) => {
    if (!token) {
      setError(t('auth.resetPassword.invalidLink'));
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const response = await resetPasswordMutation.mutateAsync({
        token,
        payload: {
          password: formData.password,
        },
      });
      setSuccessMessage(response.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t('auth.resetPassword.serverError'),
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
          {t('auth.resetPassword.title')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {t('auth.resetPassword.description')}
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleSubmit(handleResetPassword)}>
            <PasswordInput
              label={t('auth.resetPassword.newPassword')}
              placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
              required
              error={errors.password?.message}
              {...register("password")}
              mb="md"
            />

            <PasswordInput
              label={t('auth.resetPassword.confirmPassword')}
              placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
              required
              error={errors.passwordConfirm?.message}
              {...register("passwordConfirm")}
            />

            {error && (
              <Text c="red" size="sm" mt="sm">
                {error}
              </Text>
            )}

            {successMessage && (
              <Text c="teal" size="sm" mt="sm">
                {successMessage}
              </Text>
            )}

            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={isSubmitting || resetPasswordMutation.isPending}
            >
              {t('auth.resetPassword.submit')}
            </Button>
          </form>

          <Text c="dimmed" size="sm" ta="center" mt="md">
            {t('auth.resetPassword.backToLogin')}{" "}
            <Anchor component={Link} to="/login" size="sm">
              {t('auth.resetPassword.loginLink')}
            </Anchor>
          </Text>
        </Paper>
      </div>
    </Flex>
  );
};

export default ResetPassword;
