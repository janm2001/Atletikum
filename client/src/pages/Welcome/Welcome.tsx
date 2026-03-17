import {
  Container,
  Title,
  Text,
  Button,
  SimpleGrid,
  Card,
  ThemeIcon,
  Stack,
  Center,
  Group,
} from "@mantine/core";
import {
  IconBarbell,
  IconStar,
  IconBook2,
  IconTrophy,
  IconChartLine,
  IconMedal,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import atletikumFullLogo from "../../assets/atletikum_full_logo.png";

const FEATURES = [
  { key: "training", icon: IconBarbell, color: "violet" },
  { key: "xp", icon: IconStar, color: "yellow" },
  { key: "knowledge", icon: IconBook2, color: "blue" },
  { key: "achievements", icon: IconMedal, color: "orange" },
  { key: "leaderboard", icon: IconTrophy, color: "teal" },
  { key: "personalBests", icon: IconChartLine, color: "green" },
] as const;

const Welcome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Stack gap="xs" ta="center" align="center">
          <img
            src={atletikumFullLogo}
            alt="Atletikum"
            style={{ maxWidth: 300 }}
          />
          <Title order={1}>{t("welcome.title")}</Title>
          <Text c="dimmed" size="lg">
            {t("welcome.subtitle")}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {FEATURES.map(({ key, icon: Icon, color }) => (
            <Card key={key} withBorder radius="md" p="lg">
              <Group gap="sm" mb="xs">
                <ThemeIcon color={color} variant="light" size="lg" radius="md">
                  <Icon size={20} />
                </ThemeIcon>
                <Text fw={600} size="sm">
                  {t(`welcome.features.${key}.title`)}
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                {t(`welcome.features.${key}.description`)}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Center>
          <Button size="md" onClick={() => navigate("/pregled")}>
            {t("welcome.cta")}
          </Button>
        </Center>
      </Stack>
    </Container>
  );
};

export default Welcome;
