import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  HoverCard,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import {
  IconBarbell,
  IconBook,
  IconFlame,
  IconLayoutDashboard,
  IconLogout2,
  IconMenu2,
  IconMoon,
  IconSettings,
  IconSun,
  IconTrophy,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useGamificationStatus } from "@/hooks/useGamification";
import { useUser } from "@/hooks/useUser";
import atletikumIcon from "@/assets/atletikum_icon.png";
import NavbarLevelDropdown from "./NavbarLevelDropdown";
import NavbarStreakDropdown from "./NavbarStreakDropdown";

type NavItem = {
  to: string;
  label: string;
  icon: typeof IconLayoutDashboard;
};

const Navbar = () => {
  const { logout, user } = useUser();
  const { t } = useTranslation();
  const location = useLocation();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const { data: gamification } = useGamificationStatus();

  const mode = computedColorScheme === "dark" ? "dark" : "light";
  const stitch = theme.other.stitch[mode];
  const isDark = mode === "dark";

  const navItems = useMemo<NavItem[]>(
    () => [
      { to: "/pregled", label: t("nav.overview"), icon: IconLayoutDashboard },
      { to: "/zapis-treninga", label: t("nav.trainingLogs"), icon: IconBarbell },
      { to: "/edukacija", label: t("nav.education"), icon: IconBook },
      { to: "/ljestvica", label: t("nav.leaderboard"), icon: IconTrophy },
      ...(user?.role === "admin"
        ? [{ to: "/upravljanje", label: t("nav.admin"), icon: IconSettings }]
        : []),
    ],
    [user?.role, t],
  );

  useEffect(() => {
    document.body.style.overflow = opened ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  const isActive = (path: string) => {
    if (location.pathname === path) {
      return true;
    }
    return location.pathname.startsWith(`${path}/`);
  };

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  const streakDropdownProps = {
    streakAtRisk: gamification?.streakAtRisk ?? false,
    hasActivityToday: gamification?.hasActivityToday ?? false,
    streakExpiresAt: gamification?.streakExpiresAt ?? null,
    dailyStreak: user?.dailyStreak ?? 0,
  };

  const close = () => setOpened(false);

  return (
    <Group
      h="100%"
      px={{ base: "sm", sm: "md", lg: "lg", xl: "xl" }}
      justify="space-between"
      wrap="nowrap"
      style={{
        borderBottom: `1px solid ${stitch.borderSubtle}`,
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
        }}
      >
        <img
          src={atletikumIcon}
          alt="Atletikum"
          style={{ height: 34, width: 34, borderRadius: 8 }}
        />
        <Title
          order={3}
          fw={800}
          style={{
            letterSpacing: "0.7px",
            background: `linear-gradient(135deg, ${theme.colors.stitch[5]} 0%, ${theme.colors.stitch[8]} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ATLETIKUM
        </Title>
      </Link>

      <Group gap={8} visibleFrom="lg" wrap="nowrap">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              size="sm"
              radius="xl"
              leftSection={<Icon size={16} />}
              variant={active ? "filled" : "light"}
              color={active ? "stitch" : isDark ? "gray" : "dark"}
              style={{
                backgroundColor: active ? undefined : stitch.surfaceInteractive,
                border: `1px solid ${active ? "transparent" : stitch.borderSubtle}`,
                color: active ? undefined : isDark ? "#DFE5F6" : "#1F2A3D",
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Group>

      <Group gap={8} visibleFrom="lg" wrap="nowrap">
        <HoverCard width={250} shadow="md" position="bottom-end" withArrow>
          <HoverCard.Target>
            <Badge
              variant="light"
              color="stitch"
              size="lg"
              style={{
                cursor: "pointer",
                backgroundColor: stitch.surfaceInteractive,
                border: `1px solid ${stitch.borderSubtle}`,
              }}
            >
              {t("nav.levelBadge", { level: user?.level })}
            </Badge>
          </HoverCard.Target>
          <HoverCard.Dropdown
            style={{
              borderColor: stitch.borderSubtle,
              backgroundColor: stitch.surfaceRaised,
            }}
          >
            <NavbarLevelDropdown
              level={user?.level ?? 1}
              totalXp={user?.totalXp ?? 0}
            />
          </HoverCard.Dropdown>
        </HoverCard>

        <HoverCard width={250} shadow="md" position="bottom-end" withArrow>
          <HoverCard.Target>
            <Badge
              size="lg"
              variant="light"
              color={gamification?.streakAtRisk ? "red" : "orange"}
              leftSection={<IconFlame size={14} />}
              style={{
                cursor: "pointer",
                backgroundColor: stitch.surfaceInteractive,
                border: `1px solid ${stitch.borderSubtle}`,
              }}
            >
              {user?.dailyStreak ?? 0}
            </Badge>
          </HoverCard.Target>
          <HoverCard.Dropdown
            style={{
              borderColor: stitch.borderSubtle,
              backgroundColor: stitch.surfaceRaised,
            }}
          >
            <NavbarStreakDropdown {...streakDropdownProps} />
          </HoverCard.Dropdown>
        </HoverCard>

        <ActionIcon
          variant="light"
          color="stitch"
          radius="xl"
          size={40}
          onClick={toggleColorScheme}
          aria-label="Toggle color scheme"
          style={{
            backgroundColor: stitch.surfaceInteractive,
            border: `1px solid ${stitch.borderSubtle}`,
          }}
        >
          {computedColorScheme === "dark" ? (
            <IconSun size={19} />
          ) : (
            <IconMoon size={19} />
          )}
        </ActionIcon>

        <ActionIcon
          component={Link}
          to="/profil"
          variant="light"
          color="stitch"
          radius="xl"
          size={40}
          aria-label={t("nav.profile")}
          style={{
            backgroundColor: stitch.surfaceInteractive,
            border: `1px solid ${stitch.borderSubtle}`,
          }}
        >
          <IconUser size={19} />
        </ActionIcon>

        <Button
          onClick={logout}
          radius="xl"
          size="sm"
          variant="gradient"
          leftSection={<IconLogout2 size={16} />}
          gradient={{ from: "stitch.6", to: "stitch.8", deg: 140 }}
          style={{
            boxShadow: isDark ? "0 8px 20px rgba(127, 86, 208, 0.28)" : "none",
          }}
        >
          {t("nav.logout")}
        </Button>
      </Group>

      <ActionIcon
        hiddenFrom="lg"
        variant="light"
        color="stitch"
        radius="xl"
        size={40}
        onClick={() => setOpened((prev) => !prev)}
        aria-label="Toggle navigation"
        style={{
          backgroundColor: stitch.surfaceInteractive,
          border: `1px solid ${stitch.borderSubtle}`,
        }}
      >
        {opened ? <IconX size={20} /> : <IconMenu2 size={20} />}
      </ActionIcon>

      {opened && (
        <>
          <Box
            hiddenFrom="lg"
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(5, 10, 18, 0.56)",
              backdropFilter: "blur(5px)",
              zIndex: 1998,
            }}
          />

          <Box
            hiddenFrom="lg"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "min(88vw, 360px)",
              height: "100vh",
              backgroundColor: stitch.surface,
              borderLeft: `1px solid ${stitch.borderStrong}`,
              boxShadow: "-18px 0 40px rgba(2, 6, 14, 0.45)",
              padding: "18px 14px",
              zIndex: 1999,
              overflowY: "auto",
            }}
          >
            <Group justify="space-between" mb="md">
              <Text fw={700}>{t("nav.menu")}</Text>
              <ActionIcon
                variant="light"
                color="gray"
                radius="xl"
                onClick={close}
                aria-label="Close navigation"
              >
                <IconX size={18} />
              </ActionIcon>
            </Group>

            <Stack gap="sm">
              <Group gap="xs" mb={2}>
                <HoverCard width={220} shadow="md" position="bottom" withArrow>
                  <HoverCard.Target>
                    <Badge
                      variant="light"
                      color="stitch"
                      style={{
                        cursor: "pointer",
                        backgroundColor: stitch.surfaceInteractive,
                        border: `1px solid ${stitch.borderSubtle}`,
                      }}
                    >
                      {t("nav.levelBadge", { level: user?.level })}
                    </Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown
                    style={{
                      borderColor: stitch.borderSubtle,
                      backgroundColor: stitch.surfaceRaised,
                    }}
                  >
                    <NavbarLevelDropdown
                      level={user?.level ?? 1}
                      totalXp={user?.totalXp ?? 0}
                    />
                  </HoverCard.Dropdown>
                </HoverCard>

                <HoverCard width={220} shadow="md" position="bottom" withArrow>
                  <HoverCard.Target>
                    <Badge
                      variant="light"
                      color={gamification?.streakAtRisk ? "red" : "orange"}
                      leftSection={<IconFlame size={12} />}
                      style={{
                        cursor: "pointer",
                        backgroundColor: stitch.surfaceInteractive,
                        border: `1px solid ${stitch.borderSubtle}`,
                      }}
                    >
                      {user?.dailyStreak ?? 0}
                    </Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown
                    style={{
                      borderColor: stitch.borderSubtle,
                      backgroundColor: stitch.surfaceRaised,
                    }}
                  >
                    <NavbarStreakDropdown {...streakDropdownProps} />
                  </HoverCard.Dropdown>
                </HoverCard>
              </Group>

              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Button
                    key={item.to}
                    component={Link}
                    to={item.to}
                    onClick={close}
                    leftSection={<Icon size={17} />}
                    justify="flex-start"
                    radius="md"
                    variant={active ? "filled" : "light"}
                    color={active ? "stitch" : isDark ? "gray" : "dark"}
                    style={{
                      backgroundColor: active
                        ? undefined
                        : stitch.surfaceInteractive,
                      border: `1px solid ${
                        active ? "transparent" : stitch.borderSubtle
                      }`,
                      color: active ? undefined : isDark ? "#DFE5F6" : "#1F2A3D",
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}

              <Button
                variant="light"
                color="stitch"
                leftSection={
                  computedColorScheme === "dark" ? (
                    <IconSun size={18} />
                  ) : (
                    <IconMoon size={18} />
                  )
                }
                justify="flex-start"
                onClick={toggleColorScheme}
                style={{
                  backgroundColor: stitch.surfaceInteractive,
                  border: `1px solid ${stitch.borderSubtle}`,
                }}
              >
                {computedColorScheme === "dark"
                  ? t("nav.lightTheme")
                  : t("nav.darkTheme")}
              </Button>

              <Button
                component={Link}
                to="/profil"
                onClick={close}
                variant="light"
                color="stitch"
                leftSection={<IconUser size={18} />}
                justify="flex-start"
                style={{
                  backgroundColor: stitch.surfaceInteractive,
                  border: `1px solid ${stitch.borderSubtle}`,
                }}
              >
                {t("nav.profile")}
              </Button>

              <Button
                onClick={() => {
                  logout();
                  close();
                }}
                variant="gradient"
                leftSection={<IconLogout2 size={18} />}
                gradient={{ from: "stitch.6", to: "stitch.8", deg: 140 }}
                justify="flex-start"
              >
                {t("nav.logout")}
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Group>
  );
};

export default Navbar;
