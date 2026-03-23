import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import classes from "./Settings.module.css";

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <Container size="sm" py={{ base: "sm", md: "md" }}>
      <Stack gap="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate("/profil")}
          className={classes.backButton}
        >
          {t("settings.backToProfile")}
        </Button>

        <Title order={1}>{t("settings.title")}</Title>

        <Card withBorder radius="md" shadow="sm" p="md" className={classes.card}>
          <Stack gap="sm">
            <Title order={3}>{t("profile.security.title")}</Title>
            <Text fw={600}>
              {t("profile.security.username", { username: user?.username })}
            </Text>
            <Text fw={600}>
              {user?.email
                ? `Email: ${user.email}`
                : t("profile.security.emailNotSet")}
            </Text>
            <Button
              mt="sm"
              variant="light"
              onClick={() =>
                navigate("/zaboravljena-lozinka", {
                  state: {
                    username: user?.username,
                    email: user?.email,
                  },
                })
              }
            >
              {t("profile.security.resetPassword")}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default Settings;
