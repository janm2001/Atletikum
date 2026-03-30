import { useRef, useState } from "react";
import { ActionIcon, Button, Group, Loader, Modal, Stack, Text, Tooltip } from "@mantine/core";
import { IconDownload, IconShare } from "@tabler/icons-react";
import ShareCardTemplate, { type ShareCardType } from "./ShareCardTemplate";

interface ShareButtonProps {
  type: ShareCardType;
  username: string;
  level?: number;
  totalXp?: number;
  achievementTitle?: string;
  streak?: number;
  variant?: "button" | "icon";
}

const ShareButton = ({
  type,
  username,
  level,
  totalXp,
  achievementTitle,
  streak,
  variant = "button",
}: ShareButtonProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const captureAndShare = async () => {
    if (!cardRef.current) return;

    setCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "atletikum-share.png", { type: "image/png" });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "Atletikum",
            text: `Pogledaj moj napredak na Atletikum!`,
            files: [file],
          });
        } else {
          // Fallback: download
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "atletikum-share.png";
          link.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch {
      // Share cancelled or failed silently
    } finally {
      setCapturing(false);
    }
  };

  const download = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "atletikum-share.png";
      link.click();
    } finally {
      setCapturing(false);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <Tooltip label="Podijeli">
          <ActionIcon
            variant="light"
            color="stitch"
            radius="xl"
            onClick={() => setPreviewOpen(true)}
          >
            <IconShare size={16} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button
          variant="light"
          leftSection={<IconShare size={16} />}
          onClick={() => setPreviewOpen(true)}
        >
          Podijeli
        </Button>
      )}

      <Modal
        opened={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Dijeli dostignuće"
        centered
        size="auto"
      >
        <Stack align="center" gap="md">
          <ShareCardTemplate
            ref={cardRef}
            type={type}
            username={username}
            level={level}
            totalXp={totalXp}
            achievementTitle={achievementTitle}
            streak={streak}
          />

          <Text size="xs" c="dimmed">Pregled kartice za dijeljenje</Text>

          <Group gap="sm">
            <Button
              leftSection={capturing ? <Loader size={16} /> : <IconShare size={16} />}
              onClick={captureAndShare}
              disabled={capturing}
            >
              Podijeli
            </Button>
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={download}
              disabled={capturing}
            >
              Preuzmi
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ShareButton;
