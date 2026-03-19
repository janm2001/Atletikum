import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconEdit, IconPlus, IconSend } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import {
  useChallengeTemplates,
  useCreateChallengeTemplate,
  usePublishChallengeTemplates,
  useUpdateChallengeTemplate,
} from "@/hooks/useAdminChallenges";
import type {
  ChallengeTemplate,
  ChallengeTemplateType,
  CreateTemplatePayload,
} from "@/types/Challenge/challenge";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";

const TEMPLATE_TYPE_OPTIONS = [
  { value: "quiz", label: "Kvizovi" },
  { value: "workout", label: "Treninzi" },
  { value: "reading", label: "Čitanje" },
  { value: "custom", label: "Prilagođeno" },
];

const getNextMondays = (count: number) => {
  const today = new Date();
  const day = today.getDay();
  const daysToNextMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  return Array.from({ length: count }, (_, i) => {
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToNextMonday + i * 7);
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, "0");
    const day = String(monday.getDate()).padStart(2, "0");
    const iso = `${year}-${month}-${day}`;
    return {
      value: iso,
      label: monday.toLocaleDateString("hr-HR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };
  });
};

interface TemplateFormValues {
  type: ChallengeTemplateType;
  targetCount: number;
  xpReward: number;
  description: string;
  enabled: boolean;
}

const defaultValues = (): TemplateFormValues => ({
  type: "quiz",
  targetCount: 3,
  xpReward: 100,
  description: "",
  enabled: true,
});

const ChallengeTemplateManager = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const weekOptions = getNextMondays(4);
  const [publishWeek, setPublishWeek] = useState<string | null>(
    weekOptions[0]?.value ?? null,
  );

  const { control, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<TemplateFormValues>({ defaultValues: defaultValues() });

  const { data: templates, isLoading } = useChallengeTemplates();
  const createMutation = useCreateChallengeTemplate();
  const updateMutation = useUpdateChallengeTemplate();
  const publishMutation = usePublishChallengeTemplates();

  const handleOpenCreate = () => {
    setEditingId(null);
    reset(defaultValues());
    setModalOpen(true);
  };

  const handleOpenEdit = (template: ChallengeTemplate) => {
    setEditingId(template.id);
    reset({
      type: template.type,
      targetCount: template.targetCount,
      xpReward: template.xpReward,
      description: template.description,
      enabled: template.enabled,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: TemplateFormValues) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ templateId: editingId, payload: values });
      } else {
        await createMutation.mutateAsync(values as CreateTemplatePayload);
      }
      setModalOpen(false);
      notifications.show({ color: "green", message: t("admin.challenges.saveSuccess") });
    } catch {
      notifications.show({ color: "red", message: t("admin.challenges.saveError") });
    }
  };

  const handlePublish = async () => {
    if (!publishWeek) return;
    try {
      const result = await publishMutation.mutateAsync({
        effectiveFromWeekStart: publishWeek,
      });
      setPublishModalOpen(false);
      notifications.show({
        color: "green",
        message: t("admin.challenges.publishSuccess", {
          count: result.published.length,
          week: publishWeek,
        }),
      });
    } catch {
      notifications.show({ color: "red", message: t("admin.challenges.publishError") });
    }
  };

  if (isLoading) return <SpinnerComponent />;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={4}>{t("admin.challenges.templatesTitle")}</Title>
        <Group gap="xs">
          <Button
            variant="outline"
            leftSection={<IconSend size={16} />}
            onClick={() => setPublishModalOpen(true)}
          >
            {t("admin.challenges.publish")}
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
            {t("admin.challenges.add")}
          </Button>
        </Group>
      </Group>

      {!templates || templates.length === 0 ? (
        <Text c="dimmed">{t("admin.challenges.empty")}</Text>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("admin.challenges.table.type")}</Table.Th>
              <Table.Th>{t("admin.challenges.table.target")}</Table.Th>
              <Table.Th>{t("admin.challenges.table.xp")}</Table.Th>
              <Table.Th>{t("admin.challenges.table.description")}</Table.Th>
              <Table.Th>{t("admin.challenges.table.enabled")}</Table.Th>
              <Table.Th>{t("admin.challenges.table.effectiveFrom")}</Table.Th>
              <Table.Th>{t("common.actions")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {templates.map((template) => (
              <Table.Tr key={template.id}>
                <Table.Td>
                  <Badge size="sm" variant="light">
                    {TEMPLATE_TYPE_OPTIONS.find((o) => o.value === template.type)
                      ?.label ?? template.type}
                  </Badge>
                </Table.Td>
                <Table.Td>{template.targetCount}</Table.Td>
                <Table.Td>{template.xpReward}</Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={1}>
                    {template.description}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    size="sm"
                    color={template.enabled ? "green" : "gray"}
                    variant="light"
                  >
                    {template.enabled
                      ? t("admin.challenges.enabled")
                      : t("admin.challenges.disabled")}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {template.effectiveFromWeekStart
                      ? new Date(template.effectiveFromWeekStart).toLocaleDateString(
                          "hr-HR",
                        )
                      : "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => handleOpenEdit(template)}
                    aria-label={t("common.edit")}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingId
            ? t("admin.challenges.editTitle")
            : t("admin.challenges.addTitle")
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="sm">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  label={t("admin.challenges.form.type")}
                  data={TEMPLATE_TYPE_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange((v as ChallengeTemplateType) ?? "quiz")}
                />
              )}
            />
            <Controller
              name="targetCount"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t("admin.challenges.form.targetCount")}
                  min={1}
                  value={field.value}
                  onChange={(v) => field.onChange(typeof v === "number" ? v : 1)}
                />
              )}
            />
            <Controller
              name="xpReward"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t("admin.challenges.form.xpReward")}
                  min={0}
                  value={field.value}
                  onChange={(v) => field.onChange(typeof v === "number" ? v : 0)}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  label={t("admin.challenges.form.description")}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label={t("admin.challenges.form.enabled")}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="subtle" type="button" onClick={() => setModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {t("common.save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title={t("admin.challenges.publishTitle")}
      >
        <Stack gap="sm">
          <Paper withBorder p="sm" radius="md" bg="yellow.1" c="yellow.9">
            <Text size="sm">{t("admin.challenges.publishNote")}</Text>
          </Paper>
          <Select
            label={t("admin.challenges.publishWeekLabel")}
            data={weekOptions}
            value={publishWeek}
            onChange={setPublishWeek}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" onClick={() => setPublishModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handlePublish}
              loading={publishMutation.isPending}
              disabled={!publishWeek}
            >
              {t("admin.challenges.publishConfirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ChallengeTemplateManager;
