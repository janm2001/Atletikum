import { Avatar, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { User } from "@/types/User/user";
import classes from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
  user: User | null;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card withBorder radius="md" shadow="sm" p="md" className={classes.card}>
      <Stack gap="md" align="center">
        <Group justify="flex-end" w="100%">
          <Button
            variant="subtle"
            size="sm"
            leftSection={<IconSettings size={18} />}
            onClick={() => navigate("/postavke")}
          >
            {t("settings.title")}
          </Button>
        </Group>

        <Avatar
          size={120}
          color="initials"
          name={user?.username}
          alt={user?.username}
          className={classes.avatar}
        />

        <Stack gap={4} align="center">
          <Text size="xl" fw={700}>
            {user?.username}
          </Text>
          <Badge size="lg" variant="light" color="violet">
            {t("nav.levelBadge", { level: user?.level ?? 1 })}
          </Badge>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ProfileHeader;
