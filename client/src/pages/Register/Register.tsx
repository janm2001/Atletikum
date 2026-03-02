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
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterInput,
} from "../../schema/register.schema";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";

interface RegisterResponse {
  user: User;
}

const Register = () => {
  const [error, setError] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
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
      const response = await apiService.post<RegisterResponse>(
        "auth/register",
        {
          username: formData.username,
          password: formData.password,
          trainingFrequency: formData.trainingFrequency,
          focus: formData.focus,
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
    }
  };

  if (isSubmitting) {
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
          <form onSubmit={handleSubmit(handleRegister)}>
            <TextInput
              label="Korisničko ime"
              placeholder="Odaberite korisničko ime"
              required
              error={errors.username?.message}
              {...register("username")}
              mb="md"
            />

            <PasswordInput
              label="Lozinka"
              placeholder="Unesite lozinku"
              required
              error={errors.password?.message}
              {...register("password")}
              mb="md"
            />

            <PasswordInput
              label="Potvrdi lozinku"
              placeholder="Potvrdi lozinku"
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
                  label="Fokus treninga"
                  placeholder="Odaberite fokus"
                  data={TRAINING_FOCUS_OPTIONS}
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
                  Frekvencija treninga: {trainingFrequency}x tjedno
                </Text>
                <Badge color="violet" variant="dot">
                  {trainingFrequency}/7 dana
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
