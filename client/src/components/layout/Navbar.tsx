// src/components/Navbar.jsx
import { Group, Button, Title } from "@mantine/core";
import { Link } from "react-router-dom";

const Navbar = () => {
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
        <Button component={Link} to="/login" variant="subtle" color="gray">
          Prijava
        </Button>
        <Button component={Link} to="/register" color="teal.5" radius="md">
          Registracija
        </Button>
      </Group>
    </Group>
  );
};

export default Navbar;
