import { useEffect, useState } from "react";
import {
  Button,
  Divider,
  FileInput,
  Group,
  Image,
  Loader,
  Modal,
  MultiSelect,
  Select,
  Stack,
  TagsInput,
  TextInput,
  Textarea,
  Text,
} from "@mantine/core";
import { IconPhoto, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ActionFeedback from "@/components/Common/ActionFeedback";
import useActionFeedback from "@/hooks/useActionFeedback";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import { useExercises } from "@/hooks/useExercise";
import {
  useArticles,
  useArticleDetail,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
} from "../../hooks/useArticle";
import {
  articleSchema,
  type ArticleFormValues,
} from "../../schema/article.schema";
import { ArticleTag, getArticleTagLabel } from "../../types/Article/article";
import type {
  ArticleSummary,
  ArticleTagType,
} from "../../types/Article/article";
import ArticlesTable from "./ArticlesTable";
import ArticleRichEditor from "./ArticleRichEditor";
import QuizEditor from "./QuizEditor";

const getDefaultFormValues = (): ArticleFormValues => ({
  title: "",
  summary: "",
  content: "",
  actionSummary: [],
  tag: ArticleTag.TRAINING,
  sourceUrl: "",
  sourceTitle: "",
  coverImage: "",
  relatedArticleIds: [],
  relatedExerciseIds: [],
  author: "Atletikum Tim",
  quiz: [],
});

const ArticlesTab = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const { actionError, clearActionError, handleActionError } =
    useActionFeedback();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const { data: articles, isLoading, error } = useArticles();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();
  const { data: exercises } = useExercises();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: getDefaultFormValues(),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const { data: fullArticle, isLoading: isLoadingDetail } = useArticleDetail(
    editingArticleId ?? "",
  );

  useEffect(() => {
    if (fullArticle && editingArticleId) {
      reset({
        title: fullArticle.title,
        summary: fullArticle.summary,
        content: fullArticle.content || "",
        actionSummary: fullArticle.actionSummary ?? [],
        tag: fullArticle.tag,
        sourceUrl: fullArticle.sourceUrl || "",
        sourceTitle: fullArticle.sourceTitle || "",
        coverImage: fullArticle.coverImage || "",
        relatedArticleIds: fullArticle.relatedArticleIds ?? [],
        relatedExerciseIds: fullArticle.relatedExerciseIds ?? [],
        author: fullArticle.author || "Atletikum Tim",
        quiz: fullArticle.quiz ?? [],
      });
    }
  }, [fullArticle, editingArticleId, reset]);

  const handleOpenCreate = () => {
    setEditingArticleId(null);
    reset(getDefaultFormValues());
    setThumbnailFile(null);
    setThumbnailPreview(null);
    clearActionError();
    setOpened(true);
  };

  const handleOpenEdit = (article: ArticleSummary) => {
    setEditingArticleId(article._id);
    setThumbnailFile(null);
    setThumbnailPreview(article.coverImage || null);
    reset({
      title: article.title,
      summary: article.summary,
      content: article.content || "",
      actionSummary: article.actionSummary ?? [],
      tag: article.tag,
      sourceUrl: article.sourceUrl || "",
      sourceTitle: article.sourceTitle || "",
      coverImage: article.coverImage || "",
      relatedArticleIds: article.relatedArticleIds ?? [],
      relatedExerciseIds: article.relatedExerciseIds ?? [],
      author: article.author || "Atletikum Tim",
      quiz: [],
    });
    clearActionError();
    setOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.articles.deleteConfirm"))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onSubmit = async (data: ArticleFormValues) => {
    try {
      clearActionError();

      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnailFile);
        formData.append("title", data.title);
        formData.append("tag", data.tag);
        if (data.summary) formData.append("summary", data.summary);
        formData.append("content", data.content);
        if (data.actionSummary && data.actionSummary.length > 0) {
          formData.append("actionSummary", JSON.stringify(data.actionSummary));
        }
        if (data.sourceUrl) formData.append("sourceUrl", data.sourceUrl);
        if (data.sourceTitle) formData.append("sourceTitle", data.sourceTitle);
        if (data.author) formData.append("author", data.author);
        if (data.relatedArticleIds && data.relatedArticleIds.length > 0) {
          formData.append(
            "relatedArticleIds",
            JSON.stringify(data.relatedArticleIds),
          );
        }
        if (data.relatedExerciseIds && data.relatedExerciseIds.length > 0) {
          formData.append(
            "relatedExerciseIds",
            JSON.stringify(data.relatedExerciseIds),
          );
        }
        if (data.quiz && data.quiz.length > 0) {
          formData.append("quiz", JSON.stringify(data.quiz));
        }

        if (editingArticleId) {
          await updateMutation.mutateAsync({
            id: editingArticleId,
            updatedData: formData as unknown as Partial<
              import("../../types/Article/article").Article
            >,
            isFormData: true,
          });
        } else {
          await createMutation.mutateAsync({
            articleData: formData as unknown as Partial<
              import("../../types/Article/article").Article
            >,
            isFormData: true,
          });
        }
      } else {
        if (editingArticleId) {
          await updateMutation.mutateAsync({
            id: editingArticleId,
            updatedData: data,
          });
        } else {
          await createMutation.mutateAsync({ articleData: data });
        }
      }
      setOpened(false);
    } catch (error: unknown) {
      handleActionError(error, t("common.saveError"));
    }
  };

  if (isLoading) return <SpinnerComponent />;
  if (error) return <Text c="red">{t("admin.articles.loadError")}</Text>;

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          {t("admin.articles.add")}
        </Button>
      </Group>

      <ArticlesTable
        articles={articles || []}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          editingArticleId
            ? t("admin.articles.editTitle")
            : t("admin.articles.addTitle")
        }
        size="xl"
      >
        {editingArticleId && isLoadingDetail ? (
          <Group justify="center" py="xl">
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              {t("common.loading")}
            </Text>
          </Group>
        ) : (
          <FormProvider {...form}>
            <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap="md">
              <ActionFeedback message={actionError} size="sm" />

              <TextInput
                label={t("admin.articles.titleLabel")}
                placeholder={t("admin.articles.titlePlaceholder")}
                {...register("title")}
                error={errors.title?.message}
                required
              />

              <Controller
                name="tag"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t("admin.articles.category")}
                    data={Object.values(ArticleTag).map((tag) => ({
                      value: tag,
                      label: getArticleTagLabel(tag as ArticleTagType),
                    }))}
                    {...field}
                    error={errors.tag?.message}
                    required
                  />
                )}
              />

              <Textarea
                label={t("admin.articles.summary")}
                placeholder={t("admin.articles.summaryPlaceholder")}
                {...register("summary")}
                error={errors.summary?.message}
                rows={2}
              />

              <Controller
                name="actionSummary"
                control={control}
                render={({ field }) => (
                  <TagsInput
                    label={t("admin.articles.actionSummary")}
                    description={t("admin.articles.actionSummaryDescription")}
                    placeholder={t("admin.articles.actionSummaryPlaceholder")}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    error={errors.actionSummary?.message}
                  />
                )}
              />

              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <ArticleRichEditor
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.content?.message}
                  />
                )}
              />

              <Divider
                my="xs"
                label={t("admin.articles.coverImage")}
                labelPosition="center"
              />

              <FileInput
                label={t("admin.articles.uploadImage")}
                placeholder={t("admin.articles.uploadPlaceholder")}
                accept="image/*"
                leftSection={<IconPhoto size={16} />}
                value={thumbnailFile}
                onChange={(file) => {
                  setThumbnailFile(file);
                  if (file) {
                    setThumbnailPreview(URL.createObjectURL(file));
                  } else {
                    setThumbnailPreview(null);
                  }
                }}
                clearable
              />

              <TextInput
                label={t("admin.articles.imageUrlLabel")}
                placeholder="https://..."
                {...register("coverImage")}
                error={errors.coverImage?.message}
              />

              {(thumbnailPreview || form.getValues("coverImage")) && (
                <Image
                  src={thumbnailPreview || form.getValues("coverImage")}
                  height={120}
                  radius="md"
                  fit="contain"
                  alt={t("admin.articles.coverImagePreview")}
                />
              )}

              <TextInput
                label={t("admin.articles.sourceUrl")}
                placeholder={t("admin.articles.sourceUrlPlaceholder")}
                {...register("sourceUrl")}
                error={errors.sourceUrl?.message}
              />

              <TextInput
                label={t("admin.articles.sourceName")}
                placeholder={t("admin.articles.sourceNamePlaceholder")}
                {...register("sourceTitle")}
                error={errors.sourceTitle?.message}
              />

              <TextInput
                label={t("admin.articles.author")}
                {...register("author")}
                error={errors.author?.message}
              />

              <Controller
                name="relatedArticleIds"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    label={t("admin.articles.relatedArticles")}
                    data={(articles ?? [])
                      .filter((article) => article._id !== editingArticleId)
                      .map((article) => ({
                        value: article._id,
                        label: article.title,
                      }))}
                    searchable
                    clearable
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="relatedExerciseIds"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    label={t("admin.articles.relatedExercises")}
                    data={(exercises ?? []).map((exercise) => ({
                      value: exercise._id,
                      label: exercise.title,
                    }))}
                    searchable
                    clearable
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />

              <Divider
                my="sm"
                label={t("admin.articles.quiz")}
                labelPosition="center"
              />

              <QuizEditor />

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setOpened(false)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  loading={
                    isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {t("common.save")}
                </Button>
              </Group>
            </Stack>
          </FormProvider>
        )}
      </Modal>
    </>
  );
};

export default ArticlesTab;
