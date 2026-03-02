import { Container, Flex, Title } from "@mantine/core";
import { useUser } from "../../hooks/useUser";
import ProfileLevelXp from "../Profile/ProfileLevelXp/ProfileLevelXp";
import Exercises from "./Exercises/Exercises";

const Dashboard = () => {
  const { user } = useUser();
  return (
    <Container size="lg" py="md">
      <Flex direction="column" justify="center" align="center" gap="lg">
        <Title order={1}>Pregled</Title>
        <ProfileLevelXp user={user!} />
        <Exercises />
      </Flex>
    </Container>
  );
};

export default Dashboard;
