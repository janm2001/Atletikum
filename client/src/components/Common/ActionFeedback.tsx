import { Text, type TextProps } from "@mantine/core";

type ActionFeedbackProps = Omit<TextProps, "children"> & {
  message?: string | null;
};

const ActionFeedback = ({
  c = "red",
  message,
  ...textProps
}: ActionFeedbackProps) => {
  if (!message) {
    return null;
  }

  return (
    <Text c={c} {...textProps}>
      {message}
    </Text>
  );
};

export default ActionFeedback;
