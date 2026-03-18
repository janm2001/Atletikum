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
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import {
  IconFlame,
  IconLogout2,
  IconUser,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../hooks/useUser";
import { colors, styles } from "../../styles/colors";
import { useEffect, useMemo, useState } from "react";
import { getXpProgress } from "../../utils/leveling";
import atletikumIcon from "../../assets/atletikum_icon.png";

const navLinkStyles = {
  textDecoration: "none",
  color: "var(--mantine-color-text)",
  fontSize: "15px",
  fontWeight: 500,
  padding: "8px 16px",
  borderRadius: "8px 8px 0 0",
  borderBottom: "2px solid transparent",
  transition: "all 0.2s ease",
};

const NavbarLevelDropdown = ({ level, totalXp }: { level: number; totalXp: number }) => {
  const { t } = useTranslation();
  const { xpInLevel, xpForNext, remaining, percent } = getXpProgress(level, totalXp);
  return (
    <Stack gap={6}>
      <Text size="sm" fw={600}>
        {t('nav.levelProgress', { current: level, next: level + 1 })}
      </Text>
      <Progress value={percent} color="violet" radius="xl" size="md" />
      <Text size="xs" c="dimmed">
        {t('nav.xpProgress', { current: xpInLevel, total: xpForNext, percent })}
      </Text>
      <Text size="xs" c="dimmed">
        {t('nav.xpRemaining', { remaining })}
      </Text>
    </Stack>
  );
};

const Navbar = () => {
  const { logout } = useUser();
  const [opened, setOpened] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const { t } = useTranslation();

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  const close = () => {
    setOpened(false);
  };

  useEffect(() => {
    document.body.style.overflow = opened ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  const navItems = useMemo(() => [
    { to: "/pregled", label: t('nav.overview') },
    { to: "/zapis-treninga", label: t('nav.trainingLogs') },
    { to: "/edukacija", label: t('nav.education') },
    { to: "/ljestvica", label: t('nav.leaderboard') },
    ...(user?.role === "admin"
      ? [{ to: "/upravljanje", label: t('nav.admin') }]
      : []),
  ], [user?.role, t]);

  const isActive = (path: string) => {
    const pathname = location.pathname;

    if (pathname === path) {
      return true;
    }

    return pathname.startsWith(`${path}/`);
  };

  const getNavLinkStyle = (path: string) => ({
    ...navLinkStyles,
    color: isActive(path) ? colors.primary.light : "var(--mantine-color-text)",
    fontWeight: isActive(path) ? 700 : 500,
    backgroundColor: isActive(path) ? colors.interactive.hover : "transparent",
    borderBottom: isActive(path)
      ? `2px solid ${colors.primary.light}`
      : "2px solid transparent",
  });

  return (
    <Group h="100%" px="md" justify="space-between">
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
        <img src={atletikumIcon} alt="Atletikum" style={{ height: 36 }} />
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
            style={getNavLinkStyle(item.to)}
          >
            {item.label}
          </Anchor>
        ))}

        <HoverCard width={240} shadow="md" position="bottom" withArrow>
          <HoverCard.Target>
            <Badge color="violet" style={{ cursor: "pointer" }}>
              {t('nav.levelBadge', { level: user?.level })}
            </Badge>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <NavbarLevelDropdown level={user?.level ?? 1} totalXp={user?.totalXp ?? 0} />
          </HoverCard.Dropdown>
        </HoverCard>
        <Badge
          color="orange"
          variant="light"
          leftSection={<IconFlame size={14} />}
        >
          {user?.dailyStreak ?? 0}
        </Badge>

        <ActionIcon
          variant="subtle"
          color="violet"
          onClick={toggleColorScheme}
          radius="md"
          size="lg"
          aria-label="Toggle color scheme"
        >
          {computedColorScheme === "dark" ? (
            <IconSun size={20} />
          ) : (
            <IconMoon size={20} />
          )}
        </ActionIcon>

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
              backgroundColor: "var(--mantine-color-body)",
              borderLeft: `1px solid ${colors.interactive.hover}`,
              padding: "20px 14px",
              zIndex: 1999,
              overflowY: "auto",
            }}
          >
            <Group justify="space-between" mb="md">
              <Title order={4}>
                {t('nav.menu')}
              </Title>
              <Burger
                opened={opened}
                onClick={close}
                aria-label="Close navigation"
                size="sm"
              />
            </Group>

            <Stack gap="sm">
              <Group gap="xs" mb="xs">
                <HoverCard width={220} shadow="md" position="bottom" withArrow>
                  <HoverCard.Target>
                    <Badge style={{ cursor: "pointer" }}>{t('nav.levelBadge', { level: user?.level })}</Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <NavbarLevelDropdown level={user?.level ?? 1} totalXp={user?.totalXp ?? 0} />
                  </HoverCard.Dropdown>
                </HoverCard>
                <Badge
                  color="orange"
                  variant="light"
                  leftSection={<IconFlame size={14} />}
                >
                  {user?.dailyStreak ?? 0}
                </Badge>
              </Group>

              {navItems.map((item) => (
                <Anchor
                  key={item.to}
                  component={Link}
                  to={item.to}
                  onClick={close}
                  style={{
                    ...getNavLinkStyle(item.to),
                    display: "block",
                  }}
                >
                  {item.label}
                </Anchor>
              ))}

              <Button
                variant="subtle"
                color="violet"
                leftSection={
                  computedColorScheme === "dark" ? (
                    <IconSun size={18} />
                  ) : (
                    <IconMoon size={18} />
                  )
                }
                justify="flex-start"
                onClick={toggleColorScheme}
              >
                {computedColorScheme === "dark" ? t('nav.lightTheme') : t('nav.darkTheme')}
              </Button>
              <Button
                component={Link}
                to="/profil"
                onClick={close}
                variant="subtle"
                color="violet"
                leftSection={<IconUser size={18} />}
                justify="flex-start"
              >
                {t('nav.profile')}
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
                {t('nav.logout')}
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Group>
  );
};

export default Navbar;
