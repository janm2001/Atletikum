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
import classes from "./Navbar.module.css";

type NavItem = {
  to: string;
  label: string;
  icon: typeof IconLayoutDashboard;
};

const Navbar = () => {
  const { logout, user } = useUser();
  const { t } = useTranslation();
  const location = useLocation();
  const [opened, setOpened] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const { data: gamification } = useGamificationStatus();

  const isDark = computedColorScheme === "dark";

  const navItems = useMemo<NavItem[]>(
    () => [
      { to: "/pregled", label: t("nav.overview"), icon: IconLayoutDashboard },
      {
        to: "/zapis-treninga",
        label: t("nav.trainingLogs"),
        icon: IconBarbell,
      },
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
      className={classes.navGroup}
    >
      <Link to="/" className={classes.logoLink}>
        <img
          src={atletikumIcon}
          alt="Atletikum"
          className={classes.logoImage}
        />
        <Title order={3} fw={800} className={classes.logoTitle}>
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
              className={active ? undefined : classes.navBtn}
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
              className={classes.surfaceControl}
            >
              {t("nav.levelBadge", { level: user?.level })}
            </Badge>
          </HoverCard.Target>
          <HoverCard.Dropdown className={classes.hoverDropdown}>
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
              className={classes.surfaceControl}
            >
              {user?.dailyStreak ?? 0}
            </Badge>
          </HoverCard.Target>
          <HoverCard.Dropdown className={classes.hoverDropdown}>
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
          className={classes.surfaceControl}
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
          className={classes.surfaceControl}
        >
          <IconUser size={19} />
        </ActionIcon>

        <Button
          onClick={logout}
          radius="xl"
          size="sm"
          variant="gradient"
          gradient={{ from: "stitch.6", to: "stitch.8", deg: 140 }}
          className={classes.logoutBtn}
        >
          <IconLogout2 size={16} />
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
        className={classes.surfaceControl}
      >
        {opened ? <IconX size={20} /> : <IconMenu2 size={20} />}
      </ActionIcon>

      {opened && (
        <>
          <Box
            hiddenFrom="lg"
            onClick={close}
            className={classes.overlay}
          />

          <Box hiddenFrom="lg" className={classes.sidebar}>
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
                      className={classes.surfaceControl}
                    >
                      {t("nav.levelBadge", { level: user?.level })}
                    </Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown className={classes.hoverDropdown}>
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
                      className={classes.surfaceControl}
                    >
                      {user?.dailyStreak ?? 0}
                    </Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown className={classes.hoverDropdown}>
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
                    className={active ? undefined : classes.navBtn}
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
                className={classes.surfaceControl}
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
                className={classes.surfaceControl}
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
