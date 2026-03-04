import { Container, Flex, Title } from "@mantine/core";
import Exercises from "../../components/Dashboard/Exercises/Exercises";
import Workouts from "@/components/Workouts/Workouts";

const Dashboard = () => {
  return (
    <Container size="lg" py="md">
      <Flex direction="column" justify="center" align="center" gap="lg">
        <Title order={1}>Pregled</Title>
        <Workouts />
        <Exercises />
      </Flex>
    </Container>
  );
};

export default Dashboard;
