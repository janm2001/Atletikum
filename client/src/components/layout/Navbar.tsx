// src/components/Navbar.jsx
import {
  Group,
  Button,
  Title,
  Anchor,
  Burger,
  Stack,
  Box,
  Badge,
  Flex,
  HoverCard,
  Text,
  Progress,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { IconFlame, IconLogout2, IconUser } from "@tabler/icons-react";
import { useUser } from "../../hooks/useUser";
import { colors, styles } from "../../styles/colors";
import { useState } from "react";
import {
  getXpRequiredForLevelUp,
  getTotalXpForLevelStart,
} from "../../utils/leveling";

const Navbar = () => {
  const { logout } = useUser();
  const [opened, setOpened] = useState(false);
  const { user } = useUser();

  const close = () => {
    setOpened(false);
  };

  const navItems = [
    { to: "/pregled", label: "Pregled" },
    { to: "/zapis-treninga", label: "Zapis treninga" },
    { to: "/edukacija", label: "Edukacija" },
    { to: "/ljestvica", label: "Ljestvica" },
    ...(user?.role === "admin"
      ? [{ to: "/upravljanje", label: "Upravljanje" }]
      : []),
  ];

  const navLinkStyles = {
    textDecoration: "none",
    color: colors.text.primary,
    fontSize: "15px",
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Link to="/" style={{ textDecoration: "none" }}>
        <Title
          order={3}
          style={{
            ...styles.gradientText,
            fontWeight: 700,
            letterSpacing: "0.5px",
            cursor: "pointer",
          }}
        >
          ATLETIKUM
        </Title>
      </Link>

      <Group gap="xs" visibleFrom="md">
        {navItems.map((item) => (
          <Anchor
            key={item.to}
            component={Link}
            to={item.to}
            style={navLinkStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.interactive.hover;
              e.currentTarget.style.color = colors.primary.light;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.text.primary;
            }}
          >
            {item.label}
          </Anchor>
        ))}

        <HoverCard width={240} shadow="md" position="bottom" withArrow>
          <HoverCard.Target>
            <Badge color="violet" style={{ cursor: "pointer" }}>
              Level {user?.level}
            </Badge>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            {(() => {
              const level = user?.level ?? 1;
              const totalXp = user?.totalXp ?? 0;
              const xpForNext = getXpRequiredForLevelUp(level);
              const levelStart = getTotalXpForLevelStart(level);
              const currentProgress = totalXp - levelStart;
              const remaining = xpForNext - currentProgress;
              const percent = Math.min(
                100,
                Math.round((currentProgress / xpForNext) * 100),
              );
              return (
                <Stack gap={6}>
                  <Text size="sm" fw={600}>
                    Level {level} → Level {level + 1}
                  </Text>
                  <Progress
                    value={percent}
                    color="violet"
                    radius="xl"
                    size="md"
                  />
                  <Text size="xs" c="dimmed">
                    {currentProgress} / {xpForNext} XP ({percent}%)
                  </Text>
                  <Text size="xs" c="dimmed">
                    Još {remaining} XP do sljedećeg levela
                  </Text>
                </Stack>
              );
            })()}
          </HoverCard.Dropdown>
        </HoverCard>
        <Badge
          color="orange"
          variant="light"
          leftSection={<IconFlame size={14} />}
        >
          {user?.dailyStreak ?? 0}
        </Badge>

        <Button
          component={Link}
          variant="subtle"
          to="/profil"
          radius="md"
          color="violet"
          style={{ marginLeft: "8px" }}
        >
          <IconUser size={20} />
        </Button>
        <Button
          onClick={logout}
          radius="md"
          variant="gradient"
          gradient={{ from: "violet", to: "grape", deg: 135 }}
        >
          <IconLogout2 size={20} />
        </Button>
      </Group>
      <Flex gap={16} hiddenFrom="md" align="center">
        <HoverCard width={220} shadow="md" position="bottom" withArrow>
          <HoverCard.Target>
            <Badge style={{ cursor: "pointer" }}>Level {user?.level}</Badge>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            {(() => {
              const level = user?.level ?? 1;
              const totalXp = user?.totalXp ?? 0;
              const xpForNext = getXpRequiredForLevelUp(level);
              const levelStart = getTotalXpForLevelStart(level);
              const currentProgress = totalXp - levelStart;
              const remaining = xpForNext - currentProgress;
              const percent = Math.min(
                100,
                Math.round((currentProgress / xpForNext) * 100),
              );
              return (
                <Stack gap={6}>
                  <Text size="sm" fw={600}>
                    Level {level} → Level {level + 1}
                  </Text>
                  <Progress
                    value={percent}
                    color="violet"
                    radius="xl"
                    size="md"
                  />
                  <Text size="xs" c="dimmed">
                    {currentProgress} / {xpForNext} XP ({percent}%)
                  </Text>
                  <Text size="xs" c="dimmed">
                    Još {remaining} XP do sljedećeg levela
                  </Text>
                </Stack>
              );
            })()}
          </HoverCard.Dropdown>
        </HoverCard>
        <Badge
          color="orange"
          variant="light"
          leftSection={<IconFlame size={14} />}
        >
          {user?.dailyStreak ?? 0}
        </Badge>
        <Burger
          opened={opened}
          onClick={() => setOpened((o) => !o)}
          aria-label="Toggle navigation"
        />
      </Flex>

      {opened && (
        <>
          <Box
            hiddenFrom="md"
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(4px)",
              zIndex: 1998,
            }}
          />

          <Box
            hiddenFrom="md"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "min(85vw, 320px)",
              height: "100vh",
              backgroundColor: colors.background.secondary,
              borderLeft: `1px solid ${colors.interactive.hover}`,
              padding: "20px 14px",
              zIndex: 1999,
              overflowY: "auto",
            }}
          >
            <Group justify="space-between" mb="md">
              <Title order={4} c={colors.text.light}>
                Izbornik
              </Title>
              <Burger
                opened={opened}
                onClick={close}
                aria-label="Close navigation"
                size="sm"
              />
            </Group>

            <Stack gap="sm">
              {navItems.map((item) => (
                <Anchor
                  key={item.to}
                  component={Link}
                  to={item.to}
                  onClick={close}
                  style={{
                    ...navLinkStyles,
                    display: "block",
                  }}
                >
                  {item.label}
                </Anchor>
              ))}

              <Button
                component={Link}
                to="/profil"
                onClick={close}
                variant="subtle"
                color="violet"
                leftSection={<IconUser size={18} />}
                justify="flex-start"
              >
                Profil
              </Button>
              <Button
                onClick={() => {
                  logout();
                  close();
                }}
                variant="gradient"
                gradient={{ from: "violet", to: "grape", deg: 135 }}
                leftSection={<IconLogout2 size={18} />}
                justify="flex-start"
              >
                Odjava
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Group>
  );
};

export default Navbar;
