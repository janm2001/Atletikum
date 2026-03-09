import { useEffect, useState } from "react";
import {
  Button,
  Divider,
  FileInput,
  Group,
  Image,
  Loader,
  Modal,
  Select,
  Stack,
  TextInput,
  Textarea,
  Text,
} from "@mantine/core";
import { IconPhoto, IconPlus } from "@tabler/icons-react";
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
import { ArticleTag, ARTICLE_TAG_LABELS } from "../../types/Article/article";
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setActionError("");
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

      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnailFile);
        formData.append("title", data.title);
        formData.append("tag", data.tag);
        if (data.summary) formData.append("summary", data.summary);
        formData.append("content", data.content);
        if (data.sourceUrl) formData.append("sourceUrl", data.sourceUrl);
        if (data.sourceTitle) formData.append("sourceTitle", data.sourceTitle);
        if (data.author) formData.append("author", data.author);
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
                      label: ARTICLE_TAG_LABELS[tag as ArticleTagType],
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

              <Divider my="xs" label="Naslovna slika" labelPosition="center" />

              <FileInput
                label="Učitaj naslovnu sliku"
                placeholder="Odaberite datoteku..."
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
                label="Ili unesite URL naslovne slike"
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
                  alt="Pregled naslovne slike"
                />
              )}

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
