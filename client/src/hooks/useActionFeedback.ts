import { isAxiosError } from "axios";
import { useCallback, useState } from "react";

const getResponseMessage = (data: unknown) => {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim().length > 0
  ) {
    return data.message;
  }

  return null;
};

const getActionErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (isAxiosError(error)) {
    const responseMessage = getResponseMessage(error.response?.data);

    if (responseMessage) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};

const useActionFeedback = () => {
  const [actionError, setActionError] = useState<string | null>(null);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const handleActionError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      setActionError(getActionErrorMessage(error, fallbackMessage));
    },
    [],
  );

  return {
    actionError,
    clearActionError,
    handleActionError,
  };
};

export default useActionFeedback;
