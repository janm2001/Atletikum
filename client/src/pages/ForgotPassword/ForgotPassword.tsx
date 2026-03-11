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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schema/forgotPassword.schema";
import { useRequestPasswordReset } from "@/hooks/useAuth";
import type { PasswordResetRequestResponse } from "@/types/User/auth";

type ForgotPasswordLocationState = {
  username?: string;
  email?: string;
} | null;

const ForgotPassword = () => {
  const navigate = useNavigate();
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

    try {
      const response = await requestResetMutation.mutateAsync(formData);
      setResult(response);
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
          Reset lozinke
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Za ovu fazu koristimo privremenu razvojnu poveznicu umjesto slanja
          emaila.
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleSubmit(handleRequestReset)}>
            <TextInput
              label="Korisničko ime"
              placeholder="Vaše korisničko ime"
              required
              error={errors.username?.message}
              {...register("username")}
              mb="md"
            />

            <TextInput
              label="Email"
              placeholder="ime@primjer.hr"
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
                <Text fw={600}>Privremena poveznica je spremna</Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Otvorite poveznicu ispod i postavite novu lozinku.
                </Text>
                <Anchor
                  component="button"
                  type="button"
                  mt="sm"
                  onClick={() =>
                    navigate(`/reset-lozinka/${result.data.resetToken}`)
                  }
                >
                  Otvori reset lozinke
                </Anchor>
              </Paper>
            )}

            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={isSubmitting || requestResetMutation.isPending}
            >
              Kreiraj poveznicu za reset
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

export default ForgotPassword;
