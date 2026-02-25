import { Container, Title, Text, Button, Group, Center } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconHome } from "@tabler/icons-react";
import { styles } from "../../styles/colors";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Center mih="100vh">
      <Container size="sm" py={80}>
        <Group justify="center" mb="xl">
          <div style={{ textAlign: "center" }}>
            <Title
              order={1}
              style={{
                ...styles.gradientText,
                fontSize: "120px",
                fontWeight: 900,
                margin: 0,
                lineHeight: 1,
              }}
            >
              404
            </Title>
            <Title order={2} mt="md" mb="sm">
              Stranica nije pronađena
            </Title>
            <Text c="dimmed" size="lg">
              Na žalost, stranica koju tražite ne postoji. Provjerite URL i
              pokušajte ponovno.
            </Text>
          </div>
        </Group>

        <Group justify="center" mt={40}>
          <Button
            size="md"
            variant="gradient"
            gradient={{ from: "violet", to: "grape", deg: 135 }}
            onClick={() => navigate("/")}
            leftSection={<IconHome size={18} />}
          >
            Vratite se na početnu stranicu
          </Button>
        </Group>
      </Container>
    </Center>
  );
};

export default NotFoundPage;
