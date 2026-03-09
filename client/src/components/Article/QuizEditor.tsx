import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Paper,
  Radio,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  useFieldArray,
  useFormContext,
  useWatch,
  Controller,
} from "react-hook-form";
import type { ArticleFormValues } from "../../schema/article.schema";

const QuizEditor = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ArticleFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quiz",
  });

  const addQuestion = () => {
    append({
      question: "",
      options: ["", ""],
      correctIndex: 0,
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={5}>Kviz pitanja</Title>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={addQuestion}
        >
          Dodaj pitanje
        </Button>
      </Group>

      {fields.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="sm">
          Nema pitanja. Kliknite "Dodaj pitanje" za kreiranje kviza.
        </Text>
      )}

      {fields.map((field, qIndex) => (
        <QuestionItem
          key={field.id}
          qIndex={qIndex}
          onRemove={() => remove(qIndex)}
          register={register}
          control={control}
          errors={errors}
        />
      ))}
    </Stack>
  );
};

interface QuestionItemProps {
  qIndex: number;
  onRemove: () => void;
  register: ReturnType<typeof useFormContext<ArticleFormValues>>["register"];
  control: ReturnType<typeof useFormContext<ArticleFormValues>>["control"];
  errors: ReturnType<
    typeof useFormContext<ArticleFormValues>
  >["formState"]["errors"];
}

const QuestionItem = ({
  qIndex,
  onRemove,
  register,
  control,
  errors,
}: QuestionItemProps) => {
  const { setValue } = useFormContext<ArticleFormValues>();
  const options: string[] =
    useWatch({ control, name: `quiz.${qIndex}.options` }) ?? [];

  const questionErrors = errors.quiz?.[qIndex];

  const addOption = () => {
    setValue(`quiz.${qIndex}.options`, [...options, ""], {
      shouldValidate: true,
    });
  };

  const removeOption = (oIndex: number) => {
    const next = options.filter((_, i) => i !== oIndex);
    setValue(`quiz.${qIndex}.options`, next, { shouldValidate: true });
  };

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600} size="sm">
            Pitanje {qIndex + 1}
          </Text>
          <ActionIcon
            variant="light"
            color="red"
            size="sm"
            onClick={onRemove}
            title="Obriši pitanje"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>

        <TextInput
          label="Tekst pitanja"
          placeholder="Unesite pitanje..."
          {...register(`quiz.${qIndex}.question`)}
          error={questionErrors?.question?.message}
          required
        />

        <Divider label="Opcije odgovora" labelPosition="left" />

        <Controller
          control={control}
          name={`quiz.${qIndex}.correctIndex`}
          render={({ field: radioField }) => (
            <Radio.Group
              value={String(radioField.value)}
              onChange={(val) => radioField.onChange(Number(val))}
              label="Odaberite točan odgovor"
              error={questionErrors?.correctIndex?.message}
            >
              <Stack gap="xs" mt="xs">
                {options.map((_, oIndex) => (
                  <Group key={oIndex} gap="xs" wrap="nowrap">
                    <Radio value={String(oIndex)} />
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder={`Opcija ${oIndex + 1}`}
                      {...register(`quiz.${qIndex}.options.${oIndex}`)}
                      error={
                        (
                          questionErrors?.options as
                            | Record<string, { message?: string }>
                            | undefined
                        )?.[oIndex]?.message
                      }
                    />
                    {options.length > 2 && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => removeOption(oIndex)}
                        title="Ukloni opciju"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                ))}
              </Stack>
            </Radio.Group>
          )}
        />

        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconPlus size={14} />}
          onClick={addOption}
          w="fit-content"
        >
          Dodaj opciju
        </Button>
      </Stack>
    </Paper>
  );
};

export default QuizEditor;
