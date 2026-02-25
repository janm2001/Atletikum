import { Center, Loader } from "@mantine/core";

interface SpinnerComponentProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullHeight?: boolean;
}

const SpinnerComponent = ({
  size = "lg",
  fullHeight = true,
}: SpinnerComponentProps) => {
  return (
    <Center mih={fullHeight ? "100vh" : "auto"}>
      <Loader size={size} color="violet" type="dots" />
    </Center>
  );
};

export default SpinnerComponent;
