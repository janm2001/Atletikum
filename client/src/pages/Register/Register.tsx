import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Select,
  Slider,
  Group,
  Badge,
  Box,
  Stack,
} from "@mantine/core";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { getTrainingFocusOptions } from "../../enums/trainingFocus";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterInput,
} from "../../schema/register.schema";
import { useRegister } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import atletikumFullLogoWhiteText from "../../assets/atletikum_full_white_text.png";
import atletikumIcon from "../../assets/atletikum_icon.png";

const Register = () => {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      trainingFrequency: 3,
      focus: "snaga",
    },
  });

  const trainingFrequency = useWatch({
    control,
    name: "trainingFrequency",
  });

  const handleRegister = async (formData: RegisterInput) => {
    setError("");

    try {
      const response = await registerMutation.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        trainingFrequency: formData.trainingFrequency,
        focus: formData.focus,
      });

      if (response.status === "success" && response.data && response.token) {
        login(response.data.user, response.token);
        navigate("/dobrodosli");
      } else {
        setError(t("auth.register.error"));
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t("auth.register.serverError"),
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
          background:
            "linear-gradient(135deg, var(--mantine-color-violet-9) 0%, var(--mantine-color-violet-6) 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "var(--mantine-spacing-xl)",
        }}
      >
        <img
          src={atletikumFullLogoWhiteText}
          alt="Atletikum"
          style={{ width: "100%", maxWidth: 550 }}
        />
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
            <img src={atletikumIcon} alt="Atletikum" style={{ height: 48 }} />
            <Title order={2} mt="xs">
              Atletikum
            </Title>
          </Box>

          <Title ta="center" order={2}>
            {t("auth.register.title")}
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            {t("auth.register.hasAccount")}{" "}
            <Anchor component={Link} to="/login" size="sm">
              {t("auth.register.login")}
            </Anchor>
          </Text>

          <Paper withBorder shadow="md" p={30} mt="sm" radius="md">
            <form onSubmit={handleSubmit(handleRegister)}>
              <TextInput
                label={t("auth.register.username")}
                placeholder={t("auth.register.usernamePlaceholder")}
                required
                error={errors.username?.message}
                {...register("username")}
                mb="md"
              />

              <TextInput
                label={t("auth.register.email")}
                placeholder={t("auth.register.emailPlaceholder")}
                required
                error={errors.email?.message}
                {...register("email")}
                mb="md"
              />

              <PasswordInput
                label={t("auth.register.password")}
                placeholder={t("auth.register.passwordPlaceholder")}
                required
                error={errors.password?.message}
                {...register("password")}
                mb="md"
              />

              <PasswordInput
                label={t("auth.register.confirmPassword")}
                placeholder={t("auth.register.confirmPasswordPlaceholder")}
                required
                error={errors.passwordConfirm?.message}
                {...register("passwordConfirm")}
                mb="md"
              />

              <Controller
                control={control}
                name="focus"
                render={({ field }) => (
                  <Select
                    label={t("auth.register.trainingFocus")}
                    placeholder={t("auth.register.trainingFocusPlaceholder")}
                    data={getTrainingFocusOptions()}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    error={errors.focus?.message}
                    required
                    mb="md"
                  />
                )}
              />

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>
                    {t("auth.register.trainingFrequency", {
                      count: trainingFrequency,
                    })}
                  </Text>
                  <Badge color="violet" variant="dot">
                    {t("auth.register.trainingFrequencyBadge", {
                      count: trainingFrequency,
                    })}
                  </Badge>
                </Group>
                <Controller
                  control={control}
                  name="trainingFrequency"
                  render={({ field }) => (
                    <Slider
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                      max={7}
                      step={1}
                      marks={[
                        { value: 0, label: "0" },
                        { value: 7, label: "7" },
                      ]}
                      mb="md"
                    />
                  )}
                />
                {errors.trainingFrequency?.message && (
                  <Text c="red" size="sm" mt="xs" mb="md">
                    {errors.trainingFrequency.message}
                  </Text>
                )}
              </div>

              {error && (
                <Text c="red" size="sm" mt="sm" mb="md">
                  {error}
                </Text>
              )}

              <Button fullWidth mt="xl" type="submit" loading={isSubmitting || registerMutation.isPending}>
                {t("auth.register.submit")}
              </Button>
            </form>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export default Register;
