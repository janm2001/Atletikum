import { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  TextInput,
  Textarea,
  Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
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
import { ArticleTag } from "../../types/Article/article";
import type { ArticleSummary } from "../../types/Article/article";
import ArticlesTable from "./ArticlesTable";
import ArticleRichEditor from "./ArticleRichEditor";
import QuizEditor from "./QuizEditor";

const getDefaultFormValues = (): ArticleFormValues => ({
  title: "",
  summary: "",
  content: "",
  tag: ArticleTag.TRAINING,
  sourceUrl: "",
  sourceTitle: "",
  coverImage: "",
  author: "Atletikum Tim",
  quiz: [],
});

const ArticlesTab = () => {
  const [opened, setOpened] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const { data: articles, isLoading, error } = useArticles();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();

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

  // Fetch full article (with quiz) when editing
  const { data: fullArticle, isLoading: isLoadingDetail } = useArticleDetail(
    editingArticleId ?? "",
  );

  // Populate form with full article data (including quiz) when loaded
  useEffect(() => {
    if (fullArticle && editingArticleId) {
      reset({
        title: fullArticle.title,
        summary: fullArticle.summary,
        content: fullArticle.content || "",
        tag: fullArticle.tag,
        sourceUrl: fullArticle.sourceUrl || "",
        sourceTitle: fullArticle.sourceTitle || "",
        coverImage: fullArticle.coverImage || "",
        author: fullArticle.author || "Atletikum Tim",
        quiz: fullArticle.quiz ?? [],
      });
    }
  }, [fullArticle, editingArticleId, reset]);

  const handleOpenCreate = () => {
    setEditingArticleId(null);
    reset(getDefaultFormValues());
    setActionError("");
    setOpened(true);
  };

  const handleOpenEdit = (article: ArticleSummary) => {
    setEditingArticleId(article._id);
    // Reset with basic data first; full data (with quiz) loaded via useEffect
    reset({
      title: article.title,
      summary: article.summary,
      content: article.content || "",
      tag: article.tag,
      sourceUrl: article.sourceUrl || "",
      sourceTitle: article.sourceTitle || "",
      coverImage: article.coverImage || "",
      author: article.author || "Atletikum Tim",
      quiz: [],
    });
    setActionError("");
    setOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Jeste li sigurni da želite obrisati ovaj članak?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onSubmit = async (data: ArticleFormValues) => {
    try {
      setActionError("");
      if (editingArticleId) {
        await updateMutation.mutateAsync({
          id: editingArticleId,
          updatedData: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpened(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setActionError(
        err.response?.data?.message || "Došlo je do greške prilikom spremanja.",
      );
    }
  };

  if (isLoading) return <SpinnerComponent />;
  if (error) return <Text c="red">Greška pri učitavanju članaka.</Text>;

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          Novi članak
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
        title={editingArticleId ? "Uredi članak" : "Dodaj novi članak"}
        size="xl"
      >
        {editingArticleId && isLoadingDetail ? (
          <Group justify="center" py="xl">
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              Učitavanje podataka...
            </Text>
          </Group>
        ) : (
          <FormProvider {...form}>
            <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap="md">
              {actionError && (
                <Text c="red" size="sm">
                  {actionError}
                </Text>
              )}

              <TextInput
                label="Naslov"
                placeholder="Unesite naslov"
                {...register("title")}
                error={errors.title?.message}
                required
              />

              <Controller
                name="tag"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Kategorija (Tag)"
                    data={Object.values(ArticleTag).map((tag) => ({
                      value: tag,
                      label: tag,
                    }))}
                    {...field}
                    error={errors.tag?.message}
                    required
                  />
                )}
              />

              <Textarea
                label="Kratki sažetak"
                placeholder="Sažetak članka"
                {...register("summary")}
                error={errors.summary?.message}
                rows={2}
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

              <TextInput
                label="URL naslovne slike"
                placeholder="https://..."
                {...register("coverImage")}
                error={errors.coverImage?.message}
              />

              <TextInput
                label="URL istraživanja"
                placeholder="https://pubmed..."
                {...register("sourceUrl")}
                error={errors.sourceUrl?.message}
              />

              <TextInput
                label="Ime izvora"
                placeholder="Naziv studije"
                {...register("sourceTitle")}
                error={errors.sourceTitle?.message}
              />

              <TextInput
                label="Autor"
                {...register("author")}
                error={errors.author?.message}
              />

              <Divider my="sm" label="Kviz" labelPosition="center" />

              <QuizEditor />

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setOpened(false)}>
                  Odustani
                </Button>
                <Button
                  type="submit"
                  loading={
                    isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  Spremi
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
