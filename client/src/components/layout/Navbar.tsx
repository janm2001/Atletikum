// src/components/Navbar.jsx
import { Group, Button, Title, Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconLogout2, IconUser } from "@tabler/icons-react";
import { useUser } from "../../hooks/useUser";
import { colors, styles } from "../../styles/colors";

const Navbar = () => {
  const { logout } = useUser();

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

      <Group gap="xs">
        <Anchor
          component={Link}
          to="/pregled"
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
          Pregled
        </Anchor>
        <Anchor
          component={Link}
          to="/zapis-treninga"
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
          Zapis treninga
        </Anchor>
        <Anchor
          component={Link}
          to="/edukacija"
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
          Edukacija
        </Anchor>
        <Anchor
          component={Link}
          to="/upravljanje"
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
          Upravljanje
        </Anchor>

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
    </Group>
  );
};

export default Navbar;
