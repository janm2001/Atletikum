// src/components/Navbar.jsx
import { Group, Button, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconLogout2, IconUser } from "@tabler/icons-react";
import { useUser } from "../../hooks/useUser";

const Navbar = () => {
  const { logout } = useUser();
  return (
    <Group h="100%" px="md" justify="space-between">
      <Title
        order={3}
        component={Link}
        c="teal.5"
        style={{ textDecoration: "none" }}
      >
        ATLETIKUM
      </Title>

      <Group>
        <Button component={Link} to="/register" color="teal.5" radius="md">
          <IconUser />
        </Button>
        <Button onClick={logout} color="teal.5" radius="md">
          <IconLogout2 />
        </Button>
      </Group>
    </Group>
  );
};

export default Navbar;
