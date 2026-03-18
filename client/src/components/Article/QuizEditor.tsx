import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ArticleFormValues } from "../../schema/article.schema";
import QuestionItem from "./QuestionItem";

const QuizEditor = () => {
  const { t } = useTranslation();
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
        <Title order={5}>{t("quizEditor.title")}</Title>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={addQuestion}
        >
          {t("quizEditor.addQuestion")}
        </Button>
      </Group>

      {fields.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="sm">
          {t("quizEditor.empty")}
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

export default QuizEditor;
