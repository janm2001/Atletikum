import { Button, Paper, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { User } from "@/types/User/user";

interface ProfileSecurityProps {
  user: User | null;
}

const ProfileSecurity = ({ user }: ProfileSecurityProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Paper withBorder radius="md" p="lg" w="100%" maw={520}>
      <Stack gap="xs">
        <Title order={3}>{t('profile.security.title')}</Title>
        <Text fw={600}>{t('profile.security.username', { username: user?.username })}</Text>
        <Text fw={600}>
          {user?.email ? `Email: ${user.email}` : t('profile.security.emailNotSet')}
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
          {t('profile.security.resetPassword')}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ProfileSecurity;
