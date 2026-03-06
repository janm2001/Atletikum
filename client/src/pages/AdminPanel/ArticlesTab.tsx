import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
  Textarea,
  Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import {
  useArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
} from "../../hooks/useArticle";
import {
  articleSchema,
  type ArticleFormValues,
} from "../../schema/article.schema";
import { ArticleTag } from "../../types/Article/article";
import ArticlesTable from "./ArticlesTable";

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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: getDefaultFormValues(),
  });

  const handleOpenCreate = () => {
    setEditingArticleId(null);
    reset(getDefaultFormValues());
    setActionError("");
    setOpened(true);
  };

  const handleOpenEdit = (article: any) => {
    setEditingArticleId(article._id);
    reset({
      title: article.title,
      summary: article.summary,
      content: article.content || "",
      tag: article.tag,
      sourceUrl: article.sourceUrl || "",
      sourceTitle: article.sourceTitle || "",
      coverImage: article.coverImage || "",
      author: article.author || "Atletikum Tim",
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
    } catch (error: any) {
      setActionError(
        error.response?.data?.message ||
          "Došlo je do greške prilikom spremanja.",
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
        size="lg"
      >
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

          <Textarea
            label="Sadržaj članka"
            placeholder="Pun tekst članka..."
            {...register("content")}
            error={errors.content?.message}
            required
            rows={10}
            description="Imajte na umu kod uređivanja iz liste da sadržaj možda nije prikazan. Kviz je potrebno preuređivati iz posebne forme ili direktno iz baze."
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
      </Modal>
    </>
  );
};

export default ArticlesTab;
