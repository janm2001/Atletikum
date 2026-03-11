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

const ResetPassword = () => {
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
      setError("Poveznica za reset nije valjana.");
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
      <div style={{ width: "100%", maxWidth: 520 }}>
        <Title ta="center" order={2}>
          Postavite novu lozinku
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Unesite novu lozinku i potvrdite promjenu.
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleSubmit(handleResetPassword)}>
            <PasswordInput
              label="Nova lozinka"
              placeholder="Unesite novu lozinku"
              required
              error={errors.password?.message}
              {...register("password")}
              mb="md"
            />

            <PasswordInput
              label="Potvrdite novu lozinku"
              placeholder="Ponovite novu lozinku"
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
              Spremi novu lozinku
            </Button>
          </form>

          <Text c="dimmed" size="sm" ta="center" mt="md">
            Povratak na prijavu{" "}
            <Anchor component={Link} to="/login" size="sm">
              Prijavite se
            </Anchor>
          </Text>
        </Paper>
      </div>
    </Flex>
  );
};

export default ResetPassword;
