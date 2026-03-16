import { Button, Group, Modal, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

type ConfirmDeleteModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
};

const ConfirmDeleteModal = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}: ConfirmDeleteModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="sm">
      <Text size="sm">{message}</Text>
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onClose} disabled={loading}>
          {t("common.cancel")}
        </Button>
        <Button color="red" onClick={onConfirm} loading={loading}>
          {t("common.delete")}
        </Button>
      </Group>
    </Modal>
  );
};

export default ConfirmDeleteModal;
