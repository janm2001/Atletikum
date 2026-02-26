// src/components/Navbar.jsx
import {
  Group,
  Button,
  Title,
  Anchor,
  Burger,
  Stack,
  Box,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { IconLogout2, IconUser } from "@tabler/icons-react";
import { useUser } from "../../hooks/useUser";
import { colors, styles } from "../../styles/colors";
import { useState } from "react";

const Navbar = () => {
  const { logout } = useUser();
  const [opened, setOpened] = useState(false);

  const close = () => {
    setOpened(false);
  };

  const navItems = [
    { to: "/pregled", label: "Pregled" },
    { to: "/zapis-treninga", label: "Zapis treninga" },
    { to: "/edukacija", label: "Edukacija" },
    { to: "/upravljanje", label: "Upravljanje" },
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

      <Burger
        opened={opened}
        onClick={() => setOpened((o) => !o)}
        hiddenFrom="md"
        aria-label="Toggle navigation"
      />

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
